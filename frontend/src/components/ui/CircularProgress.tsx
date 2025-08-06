'use client'

interface CircularProgressProps {
  percentage: number
  size?: 'sm' | 'md' | 'lg'
  strokeWidth?: number
  className?: string
  showPercentage?: boolean
  color?: string
}

export default function CircularProgress({ 
  percentage,
  size = 'md',
  strokeWidth,
  className = '',
  showPercentage = true,
  color = '#2563eb'
}: CircularProgressProps) {
  // 크기별 설정
  const sizeConfig = {
    sm: { radius: 18, defaultStroke: 2, fontSize: 'text-xs' },
    md: { radius: 24, defaultStroke: 3, fontSize: 'text-sm' },
    lg: { radius: 36, defaultStroke: 4, fontSize: 'text-base' }
  }
  
  const config = sizeConfig[size]
  const radius = config.radius
  const stroke = strokeWidth || config.defaultStroke
  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (Math.min(Math.max(percentage, 0), 100) / 100) * circumference

  const svgSize = (radius + stroke) * 2

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        height={svgSize}
        width={svgSize}
        className="transform -rotate-90"
      >
        {/* 배경 원 */}
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius + stroke}
          cy={radius + stroke}
        />
        {/* 진행률 원 */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius + stroke}
          cy={radius + stroke}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {/* 중앙 텍스트 */}
      {showPercentage && (
        <div className={`absolute inset-0 flex items-center justify-center ${config.fontSize} font-semibold text-gray-700`}>
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  )
}