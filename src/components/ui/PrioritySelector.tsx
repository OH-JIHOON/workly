'use client'

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { 
  ExclamationTriangleIcon,
  ArrowUpIcon,
  MinusIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { TaskPriority } from '@/types/task.types'

const priorityOptions = [
  {
    value: TaskPriority.URGENT,
    label: '긴급',
    description: '즉시 처리 필요',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    icon: ExclamationTriangleIcon,
    iconColor: 'text-red-600'
  },
  {
    value: TaskPriority.HIGH,
    label: '높음',
    description: '우선순위 높음',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    icon: ArrowUpIcon,
    iconColor: 'text-orange-600'
  },
  {
    value: TaskPriority.MEDIUM,
    label: '보통',
    description: '일반적인 처리',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    icon: MinusIcon,
    iconColor: 'text-blue-600'
  },
  {
    value: TaskPriority.LOW,
    label: '낮음',
    description: '여유있을 때 처리',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    icon: ArrowDownIcon,
    iconColor: 'text-gray-600'
  }
]

interface PrioritySelectorProps {
  value: TaskPriority
  onChange: (priority: TaskPriority) => void
  disabled?: boolean
  className?: string
  showDescription?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function PrioritySelector({
  value,
  onChange,
  disabled = false,
  className = '',
  showDescription = true,
  size = 'md'
}: PrioritySelectorProps) {
  const selectedOption = priorityOptions.find(option => option.value === value) || priorityOptions[2] // 기본값: 보통

  const sizeClasses = {
    sm: 'text-sm py-1.5 pl-2 pr-8',
    md: 'text-sm py-2 pl-3 pr-10',
    lg: 'text-base py-3 pl-4 pr-12'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <div className={className}>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button 
            className={`
              relative w-full cursor-pointer rounded-lg border bg-white shadow-sm 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${selectedOption.borderColor} ${sizeClasses[size]}
            `}
          >
            <span className="flex items-center gap-2">
              <selectedOption.icon className={`${iconSizes[size]} ${selectedOption.iconColor} flex-shrink-0`} />
              <span className={`block truncate font-medium ${selectedOption.color}`}>
                {selectedOption.label}
              </span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {priorityOptions.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active, selected }) =>
                    `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                      active || selected
                        ? `${option.bgColor} ${option.color}`
                        : 'text-gray-900 hover:bg-gray-100'
                    }`
                  }
                  value={option.value}
                >
                  {({ selected, active }) => (
                    <>
                      <div className="flex items-center gap-2">
                        <option.icon 
                          className={`${iconSizes[size]} flex-shrink-0 ${
                            active || selected ? option.iconColor : 'text-gray-400'
                          }`} 
                        />
                        <div className="flex-1">
                          <span className={`block font-medium ${selected ? 'font-semibold' : ''}`}>
                            {option.label}
                          </span>
                          {showDescription && (
                            <span className={`block text-xs ${
                              active || selected ? option.color : 'text-gray-500'
                            } opacity-75`}>
                              {option.description}
                            </span>
                          )}
                        </div>
                      </div>

                      {selected && (
                        <span className={`absolute inset-y-0 right-0 flex items-center pr-3 ${option.iconColor}`}>
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}