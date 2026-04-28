import React from 'react'

const cells = [
    { x: '8%', y: '82%', w: 18, duration: '22s', delay: '-2s', opacity: 0.95 },
    { x: '16%', y: '58%', w: 26, duration: '28s', delay: '-11s', opacity: 0.9 },
    { x: '24%', y: '88%', w: 14, duration: '18s', delay: '-6s', opacity: 0.78 },
    { x: '34%', y: '72%', w: 32, duration: '30s', delay: '-15s', opacity: 0.82 },
    { x: '47%', y: '94%', w: 20, duration: '24s', delay: '-4s', opacity: 0.9 },
    { x: '56%', y: '66%', w: 40, duration: '26s', delay: '-13s', opacity: 0.75 },
    { x: '63%', y: '86%', w: 16, duration: '20s', delay: '-9s', opacity: 0.88 },
    { x: '72%', y: '78%', w: 28, duration: '29s', delay: '-17s', opacity: 0.8 },
    { x: '81%', y: '92%', w: 22, duration: '23s', delay: '-12s', opacity: 0.84 },
    { x: '88%', y: '70%', w: 36, duration: '27s', delay: '-7s', opacity: 0.72 },
    { x: '93%', y: '84%', w: 15, duration: '16s', delay: '-5s', opacity: 0.92 },
    { x: '6%', y: '36%', w: 24, duration: '25s', delay: '-19s', opacity: 0.8 },
]

export default function BloodCellBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="rbc-plasma one" />
            <div className="rbc-plasma two" />
            <div className="rbc-plasma three" />
            {cells.map((cell, index) => (
                <div
                    key={index}
                    className="rbc-float"
                    style={{
                        '--x': cell.x,
                        '--y': cell.y,
                        '--w': `${cell.w}px`,
                        '--duration': cell.duration,
                        '--delay': cell.delay,
                        opacity: cell.opacity,
                    }}
                />
            ))}
        </div>
    )
}
