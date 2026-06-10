'use client'

import { useState } from 'react'
import Image from 'next/image'

interface GalleryImage {
  id: string
  url: string
}

export default function ImageGallery({ images, alt, noImageLabel }: { images: GalleryImage[]; alt: string; noImageLabel: string }) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-[#F0EDE8] flex items-center justify-center">
        <span className="text-[#bbb] text-xs tracking-widest uppercase">{noImageLabel}</span>
      </div>
    )
  }

  return (
    <div>
      {/* 큰 이미지 */}
      <div className="aspect-square bg-[#F0EDE8] relative overflow-hidden rounded">
        <Image
          src={images[active].url}
          alt={alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain"
        />
      </div>

      {/* 썸네일 목록 (클릭 시 큰 이미지 전환) */}
      {images.length > 1 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={`w-20 h-20 bg-[#F0EDE8] relative overflow-hidden rounded border-2 transition-colors ${
                i === active ? 'border-[#1a1a1a]' : 'border-transparent hover:border-[#ccc]'
              }`}
            >
              <Image src={img.url} alt={alt} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
