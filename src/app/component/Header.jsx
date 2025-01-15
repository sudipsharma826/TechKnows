'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Navbar, TextInput, Button, Avatar } from 'flowbite-react'
import { useTheme } from 'next-themes'
import { FiSearch, FiSun, FiMoon, FiMenu, FiEdit } from 'react-icons/fi'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { dark, light } from '@clerk/themes'
import { useSelector } from 'react-redux'

export default function Header() {
  const { theme, setTheme } = useTheme()
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNavbarVisible, setIsNavbarVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const pathname = usePathname()
  const currentUser = useSelector((state) => state.user.currentUser)

  // Handle navbar visibility on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsNavbarVisible(currentScrollY <= lastScrollY || currentScrollY < 50)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle search submit
    console.log('Search:', searchTerm)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    if (isSearchVisible) setIsSearchVisible(false)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-all duration-500 ${
          isNavbarVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
              <FiEdit className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
                TechKnows
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Search Bar (Desktop) */}
              <form onSubmit={handleSubmit}>
                <div className="relative w-96">
                  <TextInput
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    icon={FiSearch}
                  />
                </div>
              </form>

              {/* Navigation Links */}
              {[{ href: '/', label: 'Home' }, { href: '/about', label: 'About' }, { href: '/contact', label: 'Contact' }, { href: '/posts', label: 'Posts' }, { href: '/categories', label: 'Categories' }]
                .map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${
                      pathname === link.href ? 'text-purple-600' : 'text-gray-600 dark:text-gray-300'
                    } hover:text-purple-600 transition-colors`}
                  >
                    {link.label}
                  </Link>
                ))}

              {/* Theme Toggle */}
              <Button
                color="gray"
                pill
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="!p-0"
              >
                {theme === 'dark' ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
              </Button>

              {/* User Avatar or Login Button */}
              {currentUser ? (
                <div className="relative">
                  <Avatar
                    alt={currentUser.displayName}
                    img={currentUser.profilePicture}
                    rounded
                    className="cursor-pointer"
                    onClick={toggleDropdown}
                  />
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                      <ul className="py-2">
                        <li>
                          <Link
                            href="/profile"
                            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Profile
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/settings"
                            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Settings
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/logout"
                            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Logout
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <SignedOut>
                  <Link href="/auth/login" className="text-gray-600 dark:text-gray-300 hover:text-purple-600">
                    LogIn
                  </Link>
                </SignedOut>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center space-x-4">
              <Button
                color="gray"
                pill
                size="sm"
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                className="!p-0.5"
              >
                <FiSearch className="h-5 w-5" />
              </Button>

              {/* Theme Toggle */}
              <Button
                color="gray"
                pill
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="!p-0"
              >
                {theme === 'dark' ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
              </Button>

              {/* Avatar or Login Button for Mobile */}
              {currentUser ? (
                <div className="relative">
                  <Avatar
                    alt={currentUser.displayName}
                    img={currentUser.profilePicture}
                    rounded
                    className="cursor-pointer"
                    onClick={toggleDropdown}
                  />
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10">
                      <ul className="py-2">
                        <li>
                          <Link
                            href="/profile"
                            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Profile
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/settings"
                            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Settings
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/logout"
                            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Logout
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <SignedOut>
                  <Link href="/auth/login" className="text-gray-600 dark:text-gray-300 hover:text-purple-600">
                    Login
                  </Link>
                </SignedOut>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                color="gray"
                pill
                size="sm"
                onClick={toggleMobileMenu}
                className="!p-0"
              >
                <FiMenu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchVisible && (
            <form onSubmit={handleSubmit} className="md:hidden px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <TextInput
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={FiSearch}
              />
            </form>
          )}

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col space-y-3">
                {[{ href: '/', label: 'Home' }, { href: '/about', label: 'About' }, { href: '/contact', label: 'Contact' }, { href: '/posts', label: 'Posts' }, { href: '/categories', label: 'Categories' }]
                  .map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`${
                        pathname === link.href ? 'text-purple-600' : 'text-gray-600 dark:text-gray-300'
                      } hover:text-purple-600 transition-colors`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
