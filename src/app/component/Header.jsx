'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Navbar, TextInput, Button, Avatar } from 'flowbite-react'
import { useTheme } from 'next-themes'
import { FiSearch, FiSun, FiMoon, FiMenu, FiEdit } from 'react-icons/fi'
import { useSelector, useDispatch } from 'react-redux'
import { clearUser } from '../../lib/slices/userSlice' // Adjust path as necessary
import { toast, Toaster } from 'sonner' // Assuming you are using sonner for notifications

export default function Header() {
  const { theme, setTheme } = useTheme()
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNavbarVisible, setIsNavbarVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch()
  const currentUser = useSelector((state) => state.user.currentUser)
  const [loading, setLoading] = useState(false)

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

  const handleSignOut = async () => {
    const userId = currentUser._id
    console.log('userId from frontend ', userId)
    setLoading(true)
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })
  
      if (!response.ok) {
        throw new Error('Failed to log out')
      }
  
      // Dispatch Redux action to clear user data
      dispatch(clearUser()) // Ensure that this clears the currentUser state in Redux
  
      // Show success toast message
      toast.success('Logged out successfully!')
  
      // Redirect to the homepage
      window.location.reload();
      router.push('/')
    } catch (error) {
      toast.error('Error during logout')
    } finally {
      setLoading(false)
    }
  }
  

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-all duration-500 ${
        isNavbarVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Toaster richColors position="top-center" />
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
                          href="/page/dashboard"
                          className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Dashboard
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
                          href="#"
                          onClick={handleSignOut}
                          className="block px-6 py-3 text-red-700 hover:text-red-900 rounded-lg shadow-md focus:outline-none"
                        >
                          {loading ? 'Logging out...' : 'Logout'}
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="text-gray-600 dark:text-gray-300 hover:text-purple-600">
                <Button gradientDuoTone="purpleToBlue" className="!p-0.5">
                  LogIn
                </Button>
              </Link>
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
                          href="/page/dashboard"
                          className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Dashboard
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
                          href="#"
                          onClick={handleSignOut}
                          className="block px-6 py-3 text-red-700 hover:text-red-900 rounded-lg shadow-md focus:outline-none"
                        >
                          {loading ? 'Logging out...' : 'Logout'}
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="text-gray-600 dark:text-gray-300 hover:text-purple-600">
                <Button gradientDuoTone="purpleToBlue" className="!p-0.5">
                  LogIn
                </Button>
              </Link>
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
          <div className="md:hidden w-full mt-2">
            <form onSubmit={handleSubmit}>
              <div className="relative w-full">
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
          </div>
        )}
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden flex flex-col mt-4 space-y-4">
            {[{ href: '/', label: 'Home' }, { href: '/about', label: 'About' }, { href: '/contact', label: 'Contact' }, { href: '/posts', label: 'Posts' }, { href: '/categories', label: 'Categories' }]
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-gray-600 dark:text-gray-300 hover:text-purple-600"
                >
                  {link.label}
                </Link>
              ))}
          </div>
        )}
      </div>
    </nav>
  )
}
