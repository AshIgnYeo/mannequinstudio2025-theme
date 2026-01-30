import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import { FaInstagram } from "react-icons/fa";

const HomeContact = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Get the contact data from WordPress options
  const mapEmbedUrl = window.mannequinStudioOptions?.contactMapEmbed;
  const contactEmail = window.mannequinStudioOptions?.contactEmail;
  const contactNumbers = window.mannequinStudioOptions?.contactNumbers;
  const instagramUrl = window.mannequinStudioOptions?.contactInstagram;

  return (
    <section
      ref={sectionRef}
      className="relative pb-20 px-4 md:px-0"
      id="contact"
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-0">
          {/* Contact Information */}
          <motion.div
            className="w-full md:w-1/3"
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-7xl mb-5">Contact</h2>

            <div className="space-y-4 text-gray-700">
              <div>
                <a
                  href={`mailto:${contactEmail}`}
                  className="hover:text-gray-900 transition-colors duration-200"
                >
                  {contactEmail}
                </a>
              </div>

              {contactNumbers &&
                contactNumbers.map(
                  (number, index) =>
                    number && (
                      <div key={`contact-${index}`}>
                        <a
                          href={`tel:${number.replace(/\s/g, "")}`}
                          className="hover:text-gray-900 transition-colors duration-200"
                        >
                          {number}
                        </a>
                      </div>
                    ),
                )}
            </div>

            {/* Instagram Link */}
            <div className="mt-8">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:opacity-75 transition-opacity duration-200 p-2 -m-2"
              >
                <FaInstagram className="text-4xl md:text-3xl text-secondary hover:text-primary transition-colors duration-300" />
              </a>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            className="w-full md:w-2/3"
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            {mapEmbedUrl ? (
              <div className="relative">
                <iframe
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "50vh" }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg shadow-lg"
                  title="Mannequin Studio Location Map"
                ></iframe>
              </div>
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">
                  Google Maps embed will be displayed here
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomeContact;
