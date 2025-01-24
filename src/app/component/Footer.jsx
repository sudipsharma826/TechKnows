"use client"

import Link from "next/link"
import { Facebook, Twitter, Linkedin, Github, Instagram } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FiEdit } from "react-icons/fi"

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-12">
        <div className="">
          {/* Brand Section */}
          {/* <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <FiEdit className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                TechKnows
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Discover amazing content and stay connected with our community.
            </p> */}
            {/* <div className="flex space-x-4"> */}
              {/* <SocialLink href="https://www.facebook.com/sudipsharma.np/" icon={Facebook} /> */}
              {/* <SocialLink href="https://twitter.com" icon={Twitter} /> */}
              {/* <SocialLink href="https://www.linkedin.com/in/sudipsharmanp/" icon={Linkedin} /> */}
              {/* <SocialLink href="https://github.com/sudipsharma826" icon={Github} /> */}
              {/* <SocialLink href="https://www.instagram.com/sudeep_sharma.np/" icon={Instagram} /> */}
            {/* </div> */}
          {/* </div> */}

          {/* Quick Links */}
          {/* <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <nav className="flex flex-col space-y-3">
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/projects">Projects</FooterLink>
              <FooterLink href="/posts">Posts</FooterLink>
            </nav>
          </div> */}

          {/* Categories
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <nav className="flex flex-col space-y-3">
              <FooterLink href="/categories/technology">Technology</FooterLink>
              <FooterLink href="/categories/design">Design</FooterLink>
              <FooterLink href="/categories/development">Development</FooterLink>
              <FooterLink href="/categories/tutorials">Tutorials</FooterLink>
            </nav>
          </div> */}

          {/* Newsletter */}
          {/* <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to our newsletter for updates and exclusive content.
            </p>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-background"
              />
              <Button className="w-full">Subscribe</Button>
            </form>
          </div> */}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © 2025 TechKnows. All rights reserved.
          </p>
          <Link href="/" className="flex items-center space-x-2">
              <FiEdit className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                TechKnows
              </span>
            </Link>
          {/* <SocialLink href="https://www.facebook.com/sudipsharma.np/" icon={Facebook} />
              {/* <SocialLink href="https://twitter.com" icon={Twitter} /> */}
              {/* <SocialLink href="https://www.linkedin.com/in/sudipsharmanp/" icon={Linkedin} /> */}
              {/* <SocialLink href="https://github.com/sudipsharma826" icon={Github} /> */}
              {/* <SocialLink href="https://www.instagram.com/sudeep_sharma.np/" icon={Instagram} /> */}
          {/* <div className="flex space-x-6">
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/terms">Terms & Conditions</FooterLink>
          </div> */}
        </div>
      </div>
    </footer>
  )
}

const SocialLink = ({ href, icon: Icon }) => {
  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-primary transition-colors"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon className="h-5 w-5" />
    </Link>
  )
}

const FooterLink = ({ href, children }) => {
  return (
    <Link
      href={href}
      className="text-sm text-muted-foreground hover:text-primary transition-colors"
    >
      {children}
    </Link>
  )
}