import { colors } from '@/styles/colors'
import clsx from 'clsx'
import { ReactNode } from 'react'
import { TextInput, TextInputProps, View, ViewProps } from 'react-native'

type Variants = 'primary' | 'secondary' | 'tertiary'

interface InputProps extends ViewProps {
  children: ReactNode
  variant?: Variants
}

function Input({ children, variant = 'primary', className, ...rest }: InputProps) {
  return (
    <View
      className={clsx(
        'max-h-16 min-h-16 flex-row items-center gap-2',
        {
          'h-14 rounded-xl border border-zinc-800 px-4': variant !== 'primary',
          'bg-zinc-950': variant === 'secondary',
          'bg-zinc-900': variant === 'tertiary',
        },
        className,
      )}
      {...rest}>
      {children}
    </View>
  )
}

function Field({ ...rest }: TextInputProps) {
  return (
    <TextInput
      className="flex-1 font-regular text-lg leading-6 text-zinc-100"
      placeholderTextColor={colors.zinc[400]}
      cursorColor={colors.lime[300]}
      selectionColor={colors.lime[300]}
      {...rest}
    />
  )
}

Input.Field = Field

export { Input }
