'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="relative w-full flex justify-between items-center py-4 md:py-8 px-4 md:px-10">
      {/* Logo */}
      <Link href={'/'} onClick={closeMenu}>
        <Image
          src="/sicodev1.svg"
          alt="sicodev-logo"
          height={70}
          width={60}
          className="h-12 w-auto md:h-[70px]"
        />
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center gap-8">
        <Link
          href={'/'}
          className="text-white hover:text-gray-300 transition-colors"
        >
          Home
        </Link>
        <Link
          href={'/frame'}
          className="text-white hover:text-gray-300 transition-colors"
        >
          Frame
        </Link>
        <Link
          href={'/about'}
          className="text-white hover:text-gray-300 transition-colors"
        >
          About Us
        </Link>
      </nav>

      {/* Desktop Right Logo */}
      <div className="hidden md:block">
        <Image
          src="/sicodev2.svg"
          alt="sicodev-text"
          height={49}
          width={177}
          className="h-auto w-auto"
        />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden text-white hover:text-gray-300 transition-colors p-2"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeMenu}
          />

          {/* Mobile Menu */}
          <nav className="fixed top-0 right-0 h-full w-64 bg-gray-900 bg-opacity-95 backdrop-blur-md z-50 md:hidden">
            <div className="flex flex-col pt-20 px-6 space-y-6">
              {/* Close button */}
              <button
                onClick={closeMenu}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors p-2"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>

              <Link
                href={'/'}
                className="text-white hover:text-purple-400 transition-colors text-lg font-medium py-3 border-b border-gray-700"
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link
                href={'/frame'}
                className="text-white hover:text-purple-400 transition-colors text-lg font-medium py-3 border-b border-gray-700"
                onClick={closeMenu}
              >
                Frame
              </Link>
              <Link
                href={'/about'}
                className="text-white hover:text-purple-400 transition-colors text-lg font-medium py-3 border-b border-gray-700"
                onClick={closeMenu}
              >
                About Us
              </Link>

              {/* Mobile Right Logo */}
              <div className="pt-8">
                <Image
                  src="/sicodev2.svg"
                  alt="sicodev-text"
                  height={40}
                  width={140}
                  className="h-auto w-auto"
                />
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  )
}

export default Navbar
