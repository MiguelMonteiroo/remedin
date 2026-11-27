package com.remedin.e2e;

import android.view.accessibility.AccessibilityNodeInfo;
import android.app.KeyguardManager;
import android.content.Context;
import android.os.SystemClock;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.uiautomator.By;
import androidx.test.uiautomator.BySelector;
import androidx.test.uiautomator.Configurator;
import androidx.test.uiautomator.UiDevice;
import androidx.test.uiautomator.UiObject2;
import androidx.test.uiautomator.Until;
import java.io.File;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TestWatcher;
import org.junit.runner.Description;
import org.junit.runner.RunWith;
import static org.junit.Assert.*;

/** Runs in an independent driver process so clearing/killing the AUT is safe. */
@RunWith(AndroidJUnit4.class)
public class RemedinFlowsTest {
    private static final String APP = "com.remedin.e2e";
    private static final long WAIT = 20000;
    private UiDevice device;
    private File evidence;

    @Rule public TestWatcher capture = new TestWatcher() {
        @Override protected void failed(Throwable error, Description description) {
            snapshot(description.getMethodName() + "-FAILED");
        }
        @Override protected void succeeded(Description description) {
            snapshot(description.getMethodName() + "-passed");
        }
    };

    @Before public void setup() throws Exception {
        device = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation());
        Configurator.getInstance().setWaitForIdleTimeout(200);
        evidence = new File(InstrumentationRegistry.getInstrumentation().getTargetContext()
            .getExternalFilesDir(null), "e2e");
        evidence.mkdirs();
        device.wakeUp();
        device.pressHome();
        device.executeShellCommand("cmd statusbar collapse");
        device.executeShellCommand("wm dismiss-keyguard");
        device.waitForIdle(1500);
        assertTrue(device.executeShellCommand("pm clear " + APP).contains("Success"));
        SystemClock.sleep(350);
        launch();
        visible(By.desc("Começar"));
    }

    private void launch() throws Exception {
        String result = device.executeShellCommand("am start -W -n " + APP + "/com.remedin.MainActivity");
        assertTrue("Activity launch failed: " + result, result.contains("Status: ok"));
    }

    private UiObject2 visible(BySelector selector) {
        UiObject2 found = findWithin(selector, WAIT);
        assertNotNull("Missing UI: " + selector, found);
        return found;
    }

    private UiObject2 findWithin(BySelector selector, long timeout) {
        long deadline = SystemClock.uptimeMillis() + timeout;
        UiObject2 found;
        do {
            found = device.findObject(selector);
            if (found != null) return found;
            SystemClock.sleep(50);
        } while (SystemClock.uptimeMillis() < deadline);
        return null;
    }

    private void tap(String label) {
        BySelector selector = By.desc(label);
        clickReachable(selector);
    }

    private UiObject2 reveal(BySelector selector) {
        UiObject2 found = findWithin(selector, 1500);
        if (found == null) {
            for (int i = 0; i < 20 && scrollContent(false); i++) { }
            found = device.findObject(selector);
        }
        for (int i = 0; found == null && i < 36; i++) {
            boolean more = scrollDown();
            found = device.findObject(selector);
            if (!more && found == null) break;
        }
        assertNotNull("Not reachable by scrolling: " + selector, found);
        assertEquals("Never interact with another application", APP, found.getApplicationPackage());
        return found;
    }

    private void label(String text) {
        clickReachable(By.text(text));
    }

    private boolean scrollDown() {
        return scrollContent(true);
    }

    private boolean scrollContent(boolean forward) {
        AccessibilityNodeInfo root = InstrumentationRegistry.getInstrumentation()
            .getUiAutomation().getRootInActiveWindow();
        AccessibilityNodeInfo scroll = outerScrollable(root);
        if (scroll == null) return false;
        // Address the container itself: a center swipe can rotate the nested wheel.
        boolean moved = scroll.performAction(forward ? AccessibilityNodeInfo.ACTION_SCROLL_FORWARD
            : AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD);
        if (moved) SystemClock.sleep(350);
        return moved;
    }

    private AccessibilityNodeInfo outerScrollable(AccessibilityNodeInfo node) {
        if (node == null) return null;
        if (APP.contentEquals(node.getPackageName() == null ? "" : node.getPackageName())
                && node.isScrollable()) return node;
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo found = outerScrollable(node.getChild(i));
            if (found != null) return found;
        }
        return null;
    }

    private void clickReachable(BySelector selector) {
        reveal(selector);
        int minimumHeight = Math.round(44 * InstrumentationRegistry.getInstrumentation()
            .getTargetContext().getResources().getDisplayMetrics().density) - 2;
        for (int attempt = 0; attempt < 8; attempt++) {
            device.waitForIdle(1500);
            UiObject2 target = reveal(selector);
            UiObject2 clickable = target;
            for (int level = 0; level < 6 && !clickable.isClickable() && clickable.getParent() != null; level++) {
                clickable = clickable.getParent();
            }
            assertEquals("Click must stay inside the isolated AUT", APP, clickable.getApplicationPackage());
            assertTrue("Selector must resolve to a clickable control: " + selector, clickable.isClickable());
            if (clickable.getVisibleBounds().height() >= minimumHeight) {
                android.graphics.Rect before = clickable.getVisibleBounds();
                SystemClock.sleep(250);
                if (!before.equals(clickable.getVisibleBounds())) continue;
                clickable.click();
                return;
            }
            if (!showControl(InstrumentationRegistry.getInstrumentation()
                    .getUiAutomation().getRootInActiveWindow(), clickable.getContentDescription())) {
                scrollDown();
            }
            SystemClock.sleep(350);
        }
        fail("Control does not expose a usable touch target: " + selector);
    }

    private boolean showControl(AccessibilityNodeInfo node, String description) {
        if (node == null || description == null || description.isEmpty()) return false;
        if (description.contentEquals(node.getContentDescription() == null ? "" : node.getContentDescription())
                && APP.contentEquals(node.getPackageName() == null ? "" : node.getPackageName())) {
            return node.performAction(AccessibilityNodeInfo.AccessibilityAction.ACTION_SHOW_ON_SCREEN.getId());
        }
        for (int i = 0; i < node.getChildCount(); i++) {
            if (showControl(node.getChild(i), description)) return true;
        }
        return false;
    }

    private void profile() {
        tap("Começar");
        reveal(By.desc("Seu nome")).setText("Pessoa E2E");
        tap("Continuar");
        reveal(By.desc("Configurar meus lembretes"));
    }

    private void answerNotificationPermission(boolean allow) {
        BySelector button = By.res("com.android.permissioncontroller",
            allow ? "permission_allow_button" : "permission_deny_button");
        UiObject2 control = device.wait(Until.findObject(button), 5000);
        assertNotNull("Notification permission prompt missing", control);
        for (int attempt = 0; attempt < 3; attempt++) {
            device.waitForIdle(1500);
            SystemClock.sleep(350);
            control = device.findObject(button);
            if (control == null) return;
            control.click();
            if (device.wait(Until.gone(button), 3000)) return;
        }
        fail("System notification permission dialog did not close");
    }

    private void onboard(boolean reminders) throws Exception {
        onboard(reminders, false);
    }

    private void onboard(boolean reminders, boolean showDetails) throws Exception {
        profile();
        if (!reminders) {
            tap("Pular configuração de lembretes por enquanto");
            tap("Continuar sem lembretes");
        } else {
            tap("Configurar meus lembretes");
            tap("Permitir notificações");
            answerNotificationPermission(true);
            visible(By.desc("Manter detalhes ocultos"));
            snapshot("onboarding-lockscreen-privacy");
            tap(showDetails ? "Mostrar detalhes" : "Manter detalhes ocultos");
            // Real special-access grants; no domain/database fixtures are injected.
            device.executeShellCommand("appops set " + APP + " SCHEDULE_EXACT_ALARM allow");
            tap("Permitir horário exato");
            visible(By.desc("Permitir tela cheia"));
            if (android.os.Build.VERSION.SDK_INT >= 34) {
                device.executeShellCommand("appops set " + APP + " USE_FULL_SCREEN_INTENT allow");
            }
            tap("Permitir tela cheia");
            tap("Ir para o aplicativo");
        }
        visible(By.text("Nenhum medicamento cadastrado"));
    }

    private void startMedication(String name) {
        if (!device.hasObject(By.text("Adicionar medicamento"))) tap("Medicamentos");
        label("Adicionar medicamento");
        reveal(By.desc("Nome do medicamento")).setText(name);
        tap("Continuar");
        visible(By.desc("Etapa 2 de 4"));
        snapshot("form-schedule");
    }

    private void saveMedication() {
        tap("Continuar");
        visible(By.desc("Etapa 3 de 4"));
        tap("Continuar");
        visible(By.desc("Etapa 4 de 4"));
        tap("Salvar medicamento");
        assertTrue("Form did not close", device.wait(Until.gone(By.desc("Etapa 4 de 4")), WAIT));
    }

    private void openDetails(String name) {
        tap("Medicamentos");
        tap("Abrir " + name);
        visible(By.text("DETALHES DO TRATAMENTO"));
    }

    @Test public void onboardingResumesAndRejectsEmptyName() throws Exception {
        tap("Começar");
        tap("Continuar");
        reveal(By.text("Informe como podemos chamar você."));
        visible(By.desc("Seu nome"));
        assertFalse(device.hasObject(By.desc("Configurar meus lembretes")));
        reveal(By.desc("Seu nome")).setText("Pessoa E2E");
        tap("Continuar");
        reveal(By.desc("Configurar meus lembretes"));
        device.pressHome();
        device.executeShellCommand("am kill " + APP);
        launch();
        reveal(By.desc("Configurar meus lembretes"));
        tap("Pular configuração de lembretes por enquanto");
        visible(By.desc("Continuar sem lembretes?"));
        tap("Continuar sem lembretes");
        visible(By.text("Nenhum medicamento cadastrado"));
    }

    @Test public void dailyDoseTakeSkipUndoAndRestart() throws Exception {
        onboard(false);
        startMedication("Diario E2E");
        setTime(LocalTime.now().plusMinutes(10));
        saveMedication();
        tap("Hoje");
        snapshot("daily-pending");
        tap("Pular dose de Diario E2E");
        reveal(By.descContains("Dose pulada:"));
        label("Desfazer");
        tap("Marcar dose como tomada");
        reveal(By.descContains("Dose tomada:"));
        snapshot("daily-registered");
        device.pressHome();
        device.executeShellCommand("am kill " + APP);
        launch();
        reveal(By.descContains("Dose tomada:"));
        tap("Histórico");
        reveal(By.descContains("Hoje. 1 de 1 tomadas"));
        reveal(By.text("Diario E2E"));
        reveal(By.desc("Status: Tomada"));
        snapshot("history-recorded-dose");
        tap("Hoje");
        label("Desfazer");
        reveal(By.desc("Pular dose de Diario E2E"));
    }

    @Test public void intervalWeekdaysEditPauseAndDelete() throws Exception {
        onboard(false);
        startMedication("Intervalo E2E");
        label("Intervalo");
        saveMedication();
        openDetails("Intervalo E2E");
        reveal(By.text("Por intervalo"));
        tap("Editar medicamento");
        reveal(By.desc("Nome do medicamento")).setText("Editado E2E");
        tap("Continuar");
        label("Semana");
        label("Seg");
        tap("Continuar");
        tap("Continuar");
        tap("Salvar alterações");
        visible(By.text("DETALHES DO TRATAMENTO"));
        reveal(By.text("Dias selecionados"));
        tap("Pausar medicamento");
        reveal(By.desc("Status: Pausado"));
        tap("Reativar medicamento");
        reveal(By.desc("Status: Ativo"));
        tap("Remover medicamento");
        tap("Confirmar remoção de Editado E2E");
        assertTrue(device.wait(Until.gone(By.text("DETALHES DO TRATAMENTO")), WAIT));
    }

    @Test public void wheelCyclesAndDoesNotChangeOnSave() throws Exception {
        onboard(false);
        startMedication("Relogio E2E");
        adjustWheel("minuto", false); // 00 -> 59
        assertSelectedTime(8, 59);
        adjustWheel("minuto", true); // 59 -> 00
        assertSelectedTime(8, 0);
        adjustWheel("minuto", true);
        assertSelectedTime(8, 1);
        saveMedication();
        openDetails("Relogio E2E");
        reveal(By.text("08:01"));
    }

    private void adjustWheel(String column, boolean increment) {
        reveal(By.descContains("Selecionar horário, " + column));
        AccessibilityNodeInfo root = InstrumentationRegistry.getInstrumentation()
            .getUiAutomation().getRootInActiveWindow();
        assertTrue("Wheel accessibility action unavailable", adjustNode(root, column, increment));
    }

    private boolean adjustNode(AccessibilityNodeInfo node, String column, boolean increment) {
        if (node == null) return false;
        if (node.getContentDescription() != null && node.getContentDescription().toString()
                .startsWith("Selecionar horário, " + column)) {
            // RN dispatches the JS action but its adjustable delegate returns false.
            // The caller asserts the resulting selected value instead.
            node.performAction(increment ? AccessibilityNodeInfo.ACTION_SCROLL_FORWARD
                : AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD);
            return true;
        }
        for (int i = 0; i < node.getChildCount(); i++) {
            if (adjustNode(node.getChild(i), column, increment)) return true;
        }
        return false;
    }

    @Test public void permissionsAndSnoozeKeepOriginalSchedule() throws Exception {
        onboard(true);
        startMedication("Adiado E2E");
        LocalTime original = LocalTime.now().plusMinutes(10);
        setTime(original);
        saveMedication();
        tap("Hoje");
        String earliest = LocalTime.now().plusMinutes(5).format(DateTimeFormatter.ofPattern("HH:mm"));
        tap("Adiar dose de Adiado E2E por 5 minutos");
        String latest = LocalTime.now().plusMinutes(5).format(DateTimeFormatter.ofPattern("HH:mm"));
        String expected = reveal(By.text(java.util.regex.Pattern.compile(
            java.util.regex.Pattern.quote(earliest) + "|" + java.util.regex.Pattern.quote(latest)))).getText();
        device.pressHome();
        device.executeShellCommand("am kill " + APP);
        launch();
        reveal(By.text(expected));
        openDetails("Adiado E2E");
        reveal(By.text(original.format(DateTimeFormatter.ofPattern("HH:mm"))));
    }

    private void setTime(LocalTime time) {
        setWheelValue("hora", 8, time.getHour(), 24);
        setWheelValue("minuto", 0, time.getMinute(), 60);
        assertSelectedTime(time.getHour(), time.getMinute());
    }

    private void setWheelValue(String column, int current, int target, int size) {
        reveal(By.descContains("Selecionar horário, " + column));
        AccessibilityNodeInfo node = findWheelNode(InstrumentationRegistry.getInstrumentation()
            .getUiAutomation().getRootInActiveWindow(), column);
        assertNotNull("Wheel is missing: " + column, node);
        while (current != target) {
            boolean increment = (target - current + size) % size <= size / 2;
            node.performAction(increment ? AccessibilityNodeInfo.ACTION_SCROLL_FORWARD
                : AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD);
            current = (current + (increment ? 1 : size - 1)) % size;
            String expected = String.format(java.util.Locale.ROOT,
                "Selecionar horário, %s, %02d", column, current);
            long deadline = SystemClock.uptimeMillis() + 5000;
            boolean updated;
            do {
                SystemClock.sleep(50);
                updated = node.refresh() && expected.contentEquals(
                    node.getContentDescription() == null ? "" : node.getContentDescription());
            } while (!updated && SystemClock.uptimeMillis() < deadline);
            assertTrue("Wheel did not reach " + expected, updated);
        }
    }

    private AccessibilityNodeInfo findWheelNode(AccessibilityNodeInfo node, String column) {
        if (node == null) return null;
        if (node.getContentDescription() != null && node.getContentDescription().toString()
                .startsWith("Selecionar horário, " + column)) return node;
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo found = findWheelNode(node.getChild(i), column);
            if (found != null) return found;
        }
        return null;
    }

    private void assertSelectedTime(int hour, int minute) {
        visible(By.desc(String.format(java.util.Locale.ROOT, "Selecionar horário, hora, %02d", hour)));
        visible(By.desc(String.format(java.util.Locale.ROOT, "Selecionar horário, minuto, %02d", minute)));
    }

    @Test public void profileAndPrivacyContactsAreReachable() throws Exception {
        onboard(false);
        tap("Perfil");
        snapshot("profile");
        label("Editar");
        reveal(By.desc("Nome do perfil")).click();
        reveal(By.desc("Nome do perfil")).setText("Perfil E2E");
        if (device.wait(Until.hasObject(By.pkg("com.google.android.inputmethod.latin")), 2000)) {
            device.pressBack();
            assertTrue("Keyboard must close before scrolling", device.wait(
                Until.gone(By.pkg("com.google.android.inputmethod.latin")), 5000));
        }
        tap("Capivara");
        label("Salvar");
        visible(By.text("Perfil E2E"));
        device.pressHome();
        device.executeShellCommand("am kill " + APP);
        launch();
        tap("Perfil");
        visible(By.text("Perfil E2E"));
        label("Editar");
        assertTrue("Avatar must survive process restart", reveal(By.desc("Capivara")).isChecked());
        label("Cancelar");
        label("Privacidade e uso");
        reveal(By.text("Patryck Daniel Silva Santos"));
        reveal(By.text("patryckdaniel@hotmail.com"));
    }

    @Test public void creationRepeatedThreeTimesPreservesHistory() throws Exception {
        onboard(false);
        for (int i = 1; i <= 3; i++) {
            startMedication("Repetido E2E " + i);
            saveMedication();
            tap("Medicamentos");
            reveal(By.desc("Abrir Repetido E2E " + i));
        }
        tap("Histórico");
        reveal(By.desc("Ontem. Sem doses programadas."));
        snapshot("history-no-invented-past");
    }

    @Test public void nativeAlarmTestHasOneNotificationAndStops() throws Exception {
        onboard(true);
        tap("Perfil");
        label("Testar em 5 segundos");
        device.pressHome();
        device.sleep();
        visible(By.text("Teste de alarme"));
        snapshot("alarm-lockscreen");
        String notifications = device.executeShellCommand("dumpsys notification --noredact");
        int active = 0;
        for (String line : notifications.split("\n")) {
            if (line.contains("NotificationRecord(") && line.contains("pkg=" + APP + " ")
                && !isGroupSummary(line)) active++;
        }
        assertEquals("Native test must publish exactly one notification", 1, active);
        device.wakeUp();
        device.executeShellCommand("wm dismiss-keyguard");
        tap("Encerrar teste de alarme");
        assertTrue(device.wait(Until.gone(By.text("Encerrar teste")), WAIT));
        assertFalse(device.executeShellCommand("dumpsys activity services " + APP)
            .contains("isForeground=true"));
        tap("Hoje");
    }

    @Test public void independentPreAlertsStaySilentAndOpenNormally() throws Exception {
        onboard(true);
        startMedication("Aviso A E2E");
        setTime(LocalTime.now().plusMinutes(4));
        saveMedication();
        startMedication("Aviso B E2E");
        setTime(LocalTime.now().plusMinutes(5));
        saveMedication();
        String notifications = device.executeShellCommand("dumpsys notification --noredact");
        int active = 0;
        StringBuilder records = new StringBuilder();
        for (String line : notifications.split("\n")) {
            if (line.contains("NotificationRecord(") && line.contains("pkg=" + APP + " ")
                && line.contains("channel=medication-pre-alerts-v4") && !isGroupSummary(line)) {
                active++;
                records.append(line).append("\n");
            }
        }
        java.nio.file.Files.write(new File(evidence, "pre-alert-inventory.txt").toPath(),
            notifications.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        assertEquals("Different times must have independent pre-alerts: " + records, 2, active);
        boolean silentChannel = false;
        for (String line : notifications.split("\n")) {
            if (line.contains("NotificationChannel{mId='medication-pre-alerts-v4'")) {
                silentChannel = line.contains("mSound=null") && line.contains("mVibrationEnabled=false");
            }
        }
        assertTrue("Pre-alert channel must disable sound and vibration", silentChannel);
        assertFalse("Pre-alert must not run alarm audio", device.executeShellCommand(
            "dumpsys activity services " + APP).contains("isForeground=true"));
        device.openNotification();
        visible(By.text("Medicamento em 5 minutos")).click();
        assertTrue("Pre-alert must close the notification shade and open the AUT", device.wait(
            Until.hasObject(By.pkg(APP).depth(0)), WAIT));
        visible(By.desc("Hoje").pkg(APP));
        assertFalse(device.hasObject(By.text("Hora dos medicamentos")));
        snapshot("pre-alert-opened-normally");
    }

    @Test public void deniedNotificationsCanBeSkippedExplicitly() throws Exception {
        profile();
        tap("Configurar meus lembretes");
        tap("Permitir notificações");
        answerNotificationPermission(false);
        reveal(By.textContains("As notificações não foram autorizadas"));
        tap("Fazer receba seus lembretes depois");
        visible(By.desc("Continuar sem lembretes?"));
        tap("Continuar sem lembretes");
        visible(By.text("Nenhum medicamento cadastrado"));
    }

    @Test @LongAlarmTest public void coldStartDoseAlarmCoversSecureLockscreen() throws Exception {
        KeyguardManager keyguard = (KeyguardManager) InstrumentationRegistry.getInstrumentation()
            .getTargetContext().getSystemService(Context.KEYGUARD_SERVICE);
        org.junit.Assume.assumeFalse("Never change an existing user's PIN", keyguard.isDeviceSecure());
        onboard(true, true);
        startMedication("Alarme real E2E");
        setTime(LocalTime.now().plusMinutes(4));
        saveMedication();
        device.executeShellCommand("locksettings set-pin 2468");
        try {
            assertTrue("Test PIN was not configured", keyguard.isDeviceSecure());
            device.pressHome();
            device.sleep();
            long deathDeadline = SystemClock.uptimeMillis() + 30000;
            do {
                // A just-delivered pre-alert may still be finishing Headless JS.
                // am kill only kills background processes; never force-stop delivery.
                device.executeShellCommand("am kill " + APP);
                SystemClock.sleep(500);
            } while (!device.executeShellCommand("pidof " + APP).trim().isEmpty()
                && SystemClock.uptimeMillis() < deathDeadline);
            assertTrue("AUT must be dead before delivery", device.executeShellCommand("pidof " + APP).trim().isEmpty());
            long lockDeadline = SystemClock.uptimeMillis() + 15000;
            while (!keyguard.isKeyguardLocked() && SystemClock.uptimeMillis() < lockDeadline) SystemClock.sleep(250);
            assertTrue("Secure keyguard must be locked", keyguard.isKeyguardLocked());
            assertNotNull("Actual dose alarm did not cover secure lockscreen", device.wait(
                Until.findObject(By.text("Hora dos medicamentos")), 270000));
            assertTrue("Alarm must not dismiss the keyguard", keyguard.isKeyguardLocked());
            snapshot("real-dose-cold-start-secure-lockscreen");
            device.wakeUp();
            device.executeShellCommand("wm dismiss-keyguard");
            device.swipe(device.getDisplayWidth() / 2, device.getDisplayHeight() * 4 / 5,
                device.getDisplayWidth() / 2, device.getDisplayHeight() / 5, 30);
            device.executeShellCommand("input text 2468");
            device.executeShellCommand("input keyevent 66");
            long unlockDeadline = SystemClock.uptimeMillis() + 10000;
            while (keyguard.isKeyguardLocked() && SystemClock.uptimeMillis() < unlockDeadline) SystemClock.sleep(250);
            assertFalse("Device did not unlock", keyguard.isKeyguardLocked());
            visible(By.text("Hora dos medicamentos"));
            snapshot("real-dose-still-front-after-unlock");
            tap("Marcar Alarme real E2E como tomado");
            assertTrue(device.wait(Until.gone(By.text("Hora dos medicamentos")), WAIT));
            tap("Hoje");
            reveal(By.descContains("Dose tomada:"));
        } finally {
            device.executeShellCommand("locksettings clear --old 2468");
            device.wakeUp();
            device.executeShellCommand("wm dismiss-keyguard");
        }
    }

    private void snapshot(String name) {
        if (device == null || evidence == null) return;
        try {
            assertTrue("Screenshot capture failed: " + name,
                device.takeScreenshot(new File(evidence, name + ".png")));
            device.dumpWindowHierarchy(new File(evidence, name + ".xml"));
        } catch (Exception error) {
            throw new AssertionError("Evidence capture failed: " + name, error);
        }
    }

    private boolean isGroupSummary(String record) {
        if (record.contains("GROUP_SUMMARY") || record.contains("tag=ranker_group")) return true;
        java.util.regex.Matcher flags = java.util.regex.Pattern.compile("flags=0x([0-9a-fA-F]+)").matcher(record);
        return flags.find() && (Long.parseLong(flags.group(1), 16) & 0x200L) != 0;
    }
}
