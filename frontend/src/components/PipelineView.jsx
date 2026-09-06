import { motion } from 'framer-motion'
import PipelineNode from './PipelineNode'

export default function PipelineView({ steps, visibleCount }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max items-center">
        {steps.map((step, i) => {
          const revealed = i < visibleCount
          const connectorActive = i < visibleCount - 1

          return (
            <div key={step.id} className="flex items-center">
              <PipelineNode step={step} index={i} revealed={revealed} />
              {i < steps.length - 1 && (
                <div className="relative mx-1 mb-6 h-[2px] w-10 overflow-hidden rounded-full bg-ink-600">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-signal-teal"
                    initial={{ width: '0%' }}
                    animate={{ width: connectorActive ? '100%' : '0%' }}
                    transition={{ duration: 0.35 }}
                  />
                  {i === visibleCount - 1 && (
                    <motion.span
                      className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-signal-amber shadow-[0_0_6px_2px_rgba(181,112,28,0.55)]"
                      animate={{ left: ['0%', '90%'] }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
