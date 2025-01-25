'use client';

import { motion } from 'framer-motion';
import { BookOpen, PenTool } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2 sm:mt-10">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Discover the World of
                <span className="text-primary"> Reading & Writing</span>
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Explore our curated collection of articles about reading and writing. Join our community of passionate readers and writers.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/posts">
                <Button size="lg" className="w-full min-[400px]:w-auto">
                  Explore Posts
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-[400px] flex items-center justify-center">
            {/* <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative w-64 h-64">
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <BookOpen className="w-24 h-24 text-primary" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ scale: [1.1, 1, 1.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <PenTool className="w-24 h-24 text-primary opacity-50" />
                </motion.div>
              </div>
            </motion.div> */}
          </div>
        </div>
      </div>
    </div>
  );
}