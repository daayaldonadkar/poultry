import { useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  HelperText,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import type { BreedRow } from '../database/types';

/** Zod validation schema for breed form */
const breedSchema = z.object({
  name: z
    .string()
    .min(1, 'Breed name is required')
    .max(100, 'Name must be under 100 characters'),
  pricePerKg: z
    .string()
    .min(1, 'Price is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Price must be greater than 0',
    }),
});

type BreedFormData = z.infer<typeof breedSchema>;

interface BreedFormDialogProps {
  visible: boolean;
  breed: BreedRow | null; // null = add mode, BreedRow = edit mode
  onDismiss: () => void;
  onSubmit: (name: string, pricePerKg: number) => Promise<void>;
}

/**
 * Modal dialog for adding or editing a breed.
 * Uses React Hook Form + Zod for validation.
 */
export function BreedFormDialog({
  visible,
  breed,
  onDismiss,
  onSubmit,
}: BreedFormDialogProps) {
  const isEditing = breed !== null;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BreedFormData>({
    resolver: zodResolver(breedSchema),
    defaultValues: {
      name: '',
      pricePerKg: '',
    },
  });

  // Reset form when dialog opens/closes or breed changes
  useEffect(() => {
    if (visible) {
      reset({
        name: breed?.name ?? '',
        pricePerKg: breed ? String(breed.price_per_kg) : '',
      });
    }
  }, [visible, breed, reset]);

  const handleFormSubmit = async (data: BreedFormData) => {
    await onSubmit(data.name.trim(), Number(data.pricePerKg));
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Text style={styles.title}>
            {isEditing ? 'Edit Breed' : 'Add Breed'}
          </Text>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.field}>
                <TextInput
                  label="Breed Name"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={!!errors.name}
                  autoFocus
                />
                {errors.name && (
                  <HelperText type="error" visible>
                    {errors.name.message}
                  </HelperText>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="pricePerKg"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.field}>
                <TextInput
                  label="Price Per KG (₹)"
                  mode="outlined"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  error={!!errors.pricePerKg}
                />
                {errors.pricePerKg && (
                  <HelperText type="error" visible>
                    {errors.pricePerKg.message}
                  </HelperText>
                )}
              </View>
            )}
          />

          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={styles.button}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit(handleFormSubmit)}
              style={styles.button}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isEditing ? 'Update' : 'Add'}
            </Button>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: Colors.surface,
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  field: {
    marginBottom: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  button: {
    minWidth: 100,
  },
});
