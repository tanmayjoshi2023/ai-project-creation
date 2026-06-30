'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Moon, Sun, Sparkles, Droplet, ChevronDown } from 'lucide-react'

const themeOptions = [
  {
    value: 'auto',
    label: 'Auto',
    description: 'Follow system preference',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Midnight',
    description: 'Dark theme for focused analysis',
    icon: Moon,
  },
  {
    value: 'gold',
    label: 'Golden',
    description: 'Warm premium theme',
    icon: Sparkles,
  },
  {
    value: 'navy',
    label: 'Navy',
    description: 'High-contrast executive style',
    icon: Droplet,
  },
]

type ThemeValue = 'auto' | 'dark' | 'gold' | 'navy'

function applyTheme(theme: ThemeValue) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.removeAttribute('data-theme')
  } else {
    root.classList.remove('dark')
    if (theme === 'auto') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
  }
}

export function ThemeSelector() {
  const [theme, setTheme] = useState<ThemeValue>('auto')

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('investiq-theme') : null
    const initial = (stored === 'dark' || stored === 'gold' || stored === 'navy' ? stored : 'auto') as ThemeValue
    setTheme(initial)
    if (typeof window !== 'undefined') {
      applyTheme(initial)
    }
  }, [])

  const handleChange = (value: string) => {
    const selected = (value === 'dark' || value === 'gold' || value === 'navy' ? value : 'auto') as ThemeValue
    setTheme(selected)
    applyTheme(selected)
    localStorage.setItem('investiq-theme', selected)
  }

  const current = themeOptions.find((option) => option.value === theme) ?? themeOptions[0]
  const Icon = current.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="gap-2" aria-label="Select theme">
            <Icon className="h-4 w-4" />
            <ChevronDown className="h-4 w-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
        </DropdownMenuGroup>
        <DropdownMenuRadioGroup value={theme} onValueChange={handleChange}>
          {themeOptions.map((option) => {
            const OptionIcon = option.icon
            return (
              <DropdownMenuRadioItem key={option.value} value={option.value} className="flex items-start gap-3">
                <div className="mt-0.5">
                  <OptionIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-foreground">{option.label}</div>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </DropdownMenuRadioItem>
            )
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
