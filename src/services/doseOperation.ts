// Serialize by occurrence so repeated taps cannot append conflicting logs.
export function createDoseOperationRunner() {
  const pending = new Map<string, Promise<void>>();
  return function run(id: string, operation: () => Promise<void>): Promise<void> {
    const existing = pending.get(id);
    if (existing) return existing;
    const promise = Promise.resolve().then(operation).finally(() => pending.delete(id));
    pending.set(id, promise);
    return promise;
  };
}

export async function finishCommittedDoseAction(
  refresh: () => Promise<void>,
  updateReminders: () => Promise<void>,
  queueRecovery: () => void
): Promise<void> {
  // A reminder failure must never leave a committed dose looking pending.
  let refreshFailed = false;
  try {
    await refresh();
  } catch {
    refreshFailed = true;
  }
  try {
    await updateReminders();
  } catch {
    queueRecovery();
    throw new Error("Dose registrada. Não foi possível atualizar o alarme agora; tentaremos novamente automaticamente.");
  }
  if (refreshFailed) throw new Error("Dose registrada. Não foi possível atualizar a tela; reabra o aplicativo para carregar os dados.");
}
