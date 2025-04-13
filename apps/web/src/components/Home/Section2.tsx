"use client";

import React from "react";
import features from "@/assets/features";
import CardForContent from "./CardForContent";
import { motion } from "framer-motion";

const containerVariants = { 
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15, // this controls the delay automatically of the cards to be shown automatically one after another
    },
  },
};

const cardVariants = { // these are the properties for each card in how it should be rendered
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

function Section2() {
  return (
    <div>
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-black leading-tight">
          Why Choose BlackTree?
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          Our platform offers everything you need to monetize your APIs and find
          the perfect solutions for your projects.
        </p>
      </div>

      <motion.div // this is for controlling how the div containing all the card components should operate like initially hide it then whileinview make it visible etc
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants} 
        initial="hidden" // 
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
      >
        {features.map(({ id, icon, heading, explanation }) => (
          <motion.div key={id} variants={cardVariants}>
            <CardForContent
              icon={icon}
              title={heading}
              description={explanation}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default Section2;
