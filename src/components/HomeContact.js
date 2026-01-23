import React from "react";
import { FaInstagram } from "react-icons/fa";

const HomeContact = () => {
  // Get the contact data from WordPress options
  const mapEmbedUrl = window.mannequinStudioOptions?.contactMapEmbed;
  const contactEmail = window.mannequinStudioOptions?.contactEmail;
  const contactNumbers = window.mannequinStudioOptions?.contactNumbers;
  const instagramUrl = window.mannequinStudioOptions?.contactInstagram;

  return (
    <section className="relative pb-20" id="contact">
      <div className="container mx-auto">
        <div className="flex items-center justify-center">
          {/* Contact Information */}
          <div className="w-1/3">
            <h2 className="text-7xl mb-5">Contact</h2>

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
                    )
                )}
            </div>

            {/* Instagram Link */}
            <div className="mt-8">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:opacity-75 transition-opacity duration-200"
              >
                <FaInstagram className="text-3xl text-secondary hover:text-primary transition-colors duration-300" />
              </a>
            </div>
          </div>

          {/* Map */}
          <div className="w-2/3">
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
                <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-md shadow-md">
                  <p className="text-sm font-medium text-gray-800">
                    372 River Valley Road
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">
                  Google Maps embed will be displayed here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeContact;
