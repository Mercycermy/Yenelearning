import { StyleSheet, Text, View, ActivityIndicator, Pressable } from 'react-native';
import { AppColors } from '../constants/colors';

export function LoadingState() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={AppColors.purple} />
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.center}>
      <Text style={styles.error}>{message}</Text>
      {onRetry ? (
        <Pressable style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({
  message,
  onRefresh,
}: {
  message: string;
  onRefresh?: () => void;
}) {
  return (
    <View style={styles.center}>
      <Text style={styles.empty}>{message}</Text>
      {onRefresh ? (
        <Pressable style={styles.button} onPress={onRefresh}>
          <Text style={styles.buttonText}>Refresh</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  color = AppColors.accent,
  disabled,
}: {
  label: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primary,
        { backgroundColor: color, opacity: disabled ? 0.5 : pressed ? 0.9 : 1 },
      ]}
    >
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  error: { color: AppColors.error, textAlign: 'center', marginBottom: 16 },
  empty: { color: AppColors.gray500, textAlign: 'center', marginBottom: 16 },
  button: {
    backgroundColor: AppColors.blue,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  buttonText: { color: AppColors.white, fontWeight: '700' },
  primary: {
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: { color: AppColors.white, fontWeight: '700', fontSize: 16 },
});
