import { createContext, useContext } from 'react'
import {
  Text,
  TextProps,
  ActivityIndicator,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native'
import clsx from 'clsx'

type Variants = 'primary' | 'secondary'

interface ButtonProps extends TouchableOpacityProps {
  variant?: Variants
  isLoading?: boolean
}

const ThemeContext = createContext<{ variant?: Variants }>({})

function Button({ children, variant = 'primary', isLoading, className, ...rest }: ButtonProps) {
  return (
    <TouchableOpacity activeOpacity={0.7} disabled={isLoading} {...rest} style={{ flex: 1 }}>
      <View
        className={clsx(
          'h-11 flex-row items-center justify-center gap-2 rounded-lg',
          {
            'bg-lime-300': variant === 'primary',
            'bg-zinc-800': variant === 'secondary',
          },
          className,
        )}>
        <ThemeContext.Provider value={{ variant }}>
          {isLoading ? <ActivityIndicator className="text-lime-950" /> : children}
        </ThemeContext.Provider>
      </View>
    </TouchableOpacity>
  )
}

function Title({ children }: TextProps) {
  const { variant } = useContext(ThemeContext)

  return (
    <Text
      className={clsx('font-semibold text-base', {
        'text-lime-950': variant === 'primary',
        'text-zinc-200': variant === 'secondary',
      })}>
      {children}
    </Text>
  )
}

Button.Title = Title

export { Button }
