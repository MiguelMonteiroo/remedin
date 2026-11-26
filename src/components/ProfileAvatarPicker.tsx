import { Image, Pressable, StyleSheet, View } from "react-native";
import { PROFILE_AVATARS, type ProfileAvatar } from "../types/domain";
import { useAppTheme } from "../theme/ThemeProvider";
import { spacing } from "../theme/spacing";
import { AppText } from "./ui/AppText";

const avatars = {
  bear: { label: "Urso", image: require("../../assets/avatars/bear.jpg") },
  cat: { label: "Gato", image: require("../../assets/avatars/cat.jpg") },
  dog: { label: "Cachorro", image: require("../../assets/avatars/dog.jpg") },
  owl: { label: "Coruja", image: require("../../assets/avatars/owl.jpg") },
  capybara: { label: "Capivara", image: require("../../assets/avatars/capybara.jpg") },
  rabbit: { label: "Coelho", image: require("../../assets/avatars/rabbit.jpg") },
  penguin: { label: "Pinguim", image: require("../../assets/avatars/penguin.jpg") },
  axolotl: { label: "Axolote", image: require("../../assets/avatars/axolotl.jpg") },
  turtle: { label: "Tartaruga", image: require("../../assets/avatars/turtle.jpg") },
  octopus: { label: "Polvo", image: require("../../assets/avatars/octopus.jpg") },
};

export function ProfileAvatarImage({ avatar, size }: { avatar: ProfileAvatar; size: number }) {
  return (
    <Image
      accessible={false}
      resizeMethod="resize"
      source={avatars[avatar].image}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  );
}

export function ProfileAvatarPicker({
  value,
  onChange,
}: {
  value?: ProfileAvatar;
  onChange: (value: ProfileAvatar) => void;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.field}>
      <AppText weight="bold" style={{ color: colors.text }}>Escolha seu avatar</AppText>
      <View accessibilityRole="radiogroup" style={styles.options}>
        {PROFILE_AVATARS.map((avatar) => (
          <Pressable
            accessibilityLabel={avatars[avatar].label}
            accessibilityRole="radio"
            accessibilityState={{ checked: value === avatar }}
            key={avatar}
            onPress={() => onChange(avatar)}
            style={({ pressed }) => [
              styles.option,
              {
                borderColor: value === avatar ? colors.primaryDark : colors.controlBorder,
                backgroundColor: colors.surface,
              },
              pressed && styles.pressed,
            ]}
          >
            <ProfileAvatarImage avatar={avatar} size={44} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm, marginVertical: spacing.lg },
  options: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  option: { borderRadius: 29, borderWidth: 2, padding: 4 },
  pressed: { opacity: 0.75 },
});
