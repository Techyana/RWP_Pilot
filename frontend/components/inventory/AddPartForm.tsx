// src/components/inventory/AddPartForm.tsx

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../../services/api'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'
import { Toast, ToastType } from '../shared/Toast'
import type { Part } from '../../types'

// 1) Zod schema for the form fields
const partSchema = z.object({
  name: z.string().min(1, 'Part name is required'),
  partNumber: z.string().min(1, 'Part number is required'),
  forDeviceModels: z.string().min(1, 'Compatible models are required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
})
type PartFormInputs = z.infer<typeof partSchema>

// 2) Exactly what the API expects: omit server‐generated & derived fields
type NewPartPayload = Omit<
  Part,
  | 'id'
  | 'status'
  | 'claimedByName'
  | 'claimedAt'
  | 'requestedByName'
  | 'requestedAtTimestamp'
  | 'availableQuantity'
>

// props
interface AddPartFormProps {
  onSuccess: (newPart: Part) => void
  onClose: () => void
}

export const AddPartForm: React.FC<AddPartFormProps> = ({
  onSuccess,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] =
    useState<{ message: string; type: ToastType } | null>(null)

  // 3) wire up RHF with Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PartFormInputs>({
    resolver: zodResolver(partSchema),
  })

  // 4) submit handler
  const onSubmit = async (data: PartFormInputs) => {
    setIsLoading(true)
    setToast(null)

    const payload: NewPartPayload = {
      name: data.name,
      partNumber: data.partNumber,
      forDeviceModels: data.forDeviceModels
        .split(',')
        .map((m) => m.trim()),
      quantity: data.quantity,
    }

    try {
      const newPart = await api.part.addPart(payload)
      onSuccess(newPart)
      setToast({ message: 'Part added successfully!', type: 'success' })
    } catch (err: any) {
      console.error('Add part failed:', err)
      setToast({
        message:
          err?.message ||
          err?.response?.data?.message ||
          'Failed to add part.',
        type: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Part Name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Part Number"
          error={errors.partNumber?.message}
          {...register('partNumber')}
        />
        <Input
          label="Compatible Models (comma-separated)"
          placeholder="e.g. Model A, Model B"
          error={errors.forDeviceModels?.message}
          {...register('forDeviceModels')}
        />
        <Input
          label="Quantity"
          type="number"
          error={errors.quantity?.message}
          {...register('quantity')}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Add Part
          </Button>
        </div>
      </form>
    </>
  )
}