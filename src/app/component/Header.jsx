'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Navbar, TextInput, Button, Avatar } from 'flowbite-react'
import { useTheme } from 'next-themes'
import { FiSearch, FiSun, FiMoon, FiMenu, FiEdit } from 'react-icons/fi'
import { SignedIn , SignedOut,SignInButton,UserButton} from '@clerk/nextjs'
import { dark, light} from '@clerk/themes'

export default function Header() {
  const { theme, setTheme } = useTheme()
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNavbarVisible, setIsNavbarVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const pathname = usePathname()

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
              {[
                { href: '/', label: 'Home' },
                { href: '/about', label: 'About' },
                { href: '/contact', label: 'Contact' },
                { href: '/posts', label: 'Posts' },
                { href: '/categories', label: 'Categories' },
              ].map((link) => (
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
              {/* For clerk user */}
                <Button gradientDuoTone='purpleToBlue' outline>
                  <SignedIn>
                    <UserButton 
                    appearance={
                      {
                       baseTheme: theme === 'dark' ? dark : light,
                      }
                    }/>
                  </SignedIn>

                  <SignedOut>
                    <Link href="/sign-in">
                      LogIn
                    </Link>
                  </SignedOut>
                </Button>

              {/* Avatar and Dropdown */}
              {/* <div className="relative">
                <Avatar
                  alt="User Avatar"
                  img="https://media.licdn.com/dms/image/v2/D4D35AQH8p1LnmX69Ig/profile-framedphoto-shrink_200_200/profile-framedphoto-shrink_200_200/0/1735264484705?e=1737118800&v=beta&t=yuGCaVv8zDoBJzFrDFZhIfcO2s9ydHpE7wb7TyXhTeQ" // Placeholder avatar, replace with dynamic data if needed
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
              </div> */}
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

              {/* Avatar for Mobile */}
              <div className="relative">
                {/* For clerk user */}
                
                <Button gradientDuoTone='purpleToBlue' outline>
                  <SignedIn>
                    <UserButton
                    appearance={
                      {
                       baseTheme: theme === 'dark' ? dark : light,
                      }
                    } />
                  </SignedIn>
                  <SignedOut>
                  <Link href="/sign-in">
                      Login
                    </Link>
                  </SignedOut>
                </Button>
                {/* <Avatar
                  alt="User Avatar"
                  img="https://media.licdn.com/dms/image/v2/D4D35AQH8p1LnmX69Ig/profile-framedphoto-shrink_200_200/profile-framedphoto-shrink_200_200/0/1735264484705?e=1737118800&v=beta&t=yuGCaVv8zDoBJzFrDFZhIfcO2s9ydHpE7wb7TyXhTeQ" // Placeholder avatar
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
                )} */}
              </div>

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
                {[
                  { href: '/', label: 'Home' },
                  { href: '/about', label: 'About' },
                  { href: '/contact', label: 'Contact' },
                  { href: '/posts', label: 'Posts' },
                  { href: '/categories', label: 'Categories' },
                ].map((link) => (
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

                <Link
                  href="/sign-up"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button gradientMonochrome="purple" size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
      {/* Spacer to prevent content from being hidden under the fixed navbar */}
      <div className="h-16 md:h-20"></div>
    </>
  )
}
