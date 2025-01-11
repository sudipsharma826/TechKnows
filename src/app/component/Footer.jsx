'use client'

import { Footer as FlowbiteFooter } from 'flowbite-react'
import Link from 'next/link'
import { BsFacebook, BsInstagram, BsTwitter, BsGithub, BsLinkedin } from 'react-icons/bs'
import { FiEdit } from 'react-icons/fi'

export default function Footer() {
  return (
    <FlowbiteFooter container className="border-t bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
              <FiEdit className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
                TechKnows
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Discover amazing content and stay connected with our community.
            </p>
            <div className="flex space-x-4">
              <FlowbiteFooter.Icon href="#" icon={BsFacebook} className="hover:text-blue-600" />
              <FlowbiteFooter.Icon href="#" icon={BsInstagram} className="hover:text-pink-600" />
              <FlowbiteFooter.Icon href="#" icon={BsTwitter} className="hover:text-blue-400" />
              <FlowbiteFooter.Icon href="#" icon={BsLinkedin} className="hover:text-blue-700" />
              <FlowbiteFooter.Icon href="#" icon={BsGithub} className="hover:text-gray-900 dark:hover:text-white" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <FlowbiteFooter.LinkGroup col className="space-y-3">
              <FlowbiteFooter.Link href="#" className="hover:text-blue-600">Home</FlowbiteFooter.Link>
              <FlowbiteFooter.Link href="#" className="hover:text-blue-600">About Us</FlowbiteFooter.Link>
              <FlowbiteFooter.Link href="#" className="hover:text-blue-600">Projects</FlowbiteFooter.Link>
              <FlowbiteFooter.Link href="#" className="hover:text-blue-600">Blog</FlowbiteFooter.Link>
            </FlowbiteFooter.LinkGroup>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <FlowbiteFooter.LinkGroup col className="space-y-3">
              <FlowbiteFooter.Link href="#" className="hover:text-blue-600">Technology</FlowbiteFooter.Link>
              <FlowbiteFooter.Link href="#" className="hover:text-blue-600">Design</FlowbiteFooter.Link>
              <FlowbiteFooter.Link href="#" className="hover:text-blue-600">Development</FlowbiteFooter.Link>
              <FlowbiteFooter.Link href="#" className="hover:text-blue-600">Tutorials</FlowbiteFooter.Link>
            </FlowbiteFooter.LinkGroup>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Subscribe to our newsletter for updates and exclusive content.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <FlowbiteFooter.Copyright
              by="TechKnows"
              year={2024}
              className="text-gray-600 dark:text-gray-400"
            />
            <div className="flex space-x-6">
              <FlowbiteFooter.Link href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
                Privacy Policy
              </FlowbiteFooter.Link>
              <FlowbiteFooter.Link href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
                Terms & Conditions
              </FlowbiteFooter.Link>
            </div>
          </div>
        </div>
      </div>
    </FlowbiteFooter>
  )
}