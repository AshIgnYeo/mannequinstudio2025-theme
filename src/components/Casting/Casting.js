import React, { useState, useEffect } from "react";
import PageWrapper from "../PageWrapper";
import PhotoUpload from "./PhotoUpload";
import ButtonPrimary from "../ButtonPrimary";
import { fetchPage } from "../../utils/pageUtils";
import { validateEmail, validatePhone, validateRequired } from "../../utils/formValidation";

const Casting = () => {
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    hair_color: '',
    eye_color: '',
    height: '',
    bust: '',
    waist: '',
    hips: '',
    shoe_size: '',
    instagram: '',
    tiktok: ''
  });

  // Photo state
  const [photos, setPhotos] = useState({
    photo_1: null,
    photo_2: null,
    photo_3: null,
    photo_4: null,
    photo_5: null
  });

  // Error state
  const [fieldErrors, setFieldErrors] = useState({});
  const [photoErrors, setPhotoErrors] = useState({});

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // { type: 'success' | 'error', message: '' }
  const [formKey, setFormKey] = useState(0); // Key to force PhotoUpload component reset

  useEffect(() => {
    const fetchCasting = async () => {
      const response = await fetchPage();
      response.error ? setError(response.content) : setPage(response.content);
    };
    fetchCasting();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle photo uploads
  const handlePhotoChange = (name, file, error) => {
    setPhotos(prev => ({ ...prev, [name]: file }));

    if (error) {
      setPhotoErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setPhotoErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Required text fields
    const requiredFields = {
      name: 'Full Name',
      email: 'Email',
      phone: 'Phone Number',
      gender: 'Gender',
      hair_color: 'Hair Color',
      eye_color: 'Eye Color',
      height: 'Height',
      bust: 'Bust',
      waist: 'Waist',
      hips: 'Hips',
      shoe_size: 'Shoe Size'
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      const validation = validateRequired(formData[field], label);
      if (!validation.valid) {
        errors[field] = validation.error;
      }
    });

    // Email validation
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Photo validation
    const photoLabels = {
      photo_1: 'Photo 1 (Mid-length)',
      photo_2: 'Photo 2 (Close-up, hair down)',
      photo_3: 'Photo 3 (Close-up, hair up)',
      photo_4: 'Photo 4 (Full length)',
      photo_5: 'Photo 5 (Full length bikini)'
    };

    const pErrors = {};
    Object.entries(photoLabels).forEach(([field, label]) => {
      if (!photos[field]) {
        pErrors[field] = `${label} is required`;
      }
    });

    setFieldErrors(errors);
    setPhotoErrors(pErrors);

    return Object.keys(errors).length === 0 && Object.keys(pErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous submit status
    setSubmitStatus(null);

    // Validate form
    if (!validateForm()) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fix all errors before submitting.'
      });
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    // Prepare form data
    const submitData = new FormData();

    // Add text fields
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });

    // Add photos
    Object.entries(photos).forEach(([key, file]) => {
      if (file) {
        submitData.append(`photos[${key}]`, file);
      }
    });

    // Add nonce
    const nonce = window.mannequinStudioOptions?.castingNonce;
    if (nonce) {
      submitData.append('nonce', nonce);
    }

    // Add action
    submitData.append('action', 'submit_casting_form');

    try {
      const ajaxUrl = window.mannequinStudioOptions?.ajaxUrl || '/wp-admin/admin-ajax.php';

      const response = await fetch(ajaxUrl, {
        method: 'POST',
        body: submitData
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: result.data.message
        });

        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          gender: '',
          hair_color: '',
          eye_color: '',
          height: '',
          bust: '',
          waist: '',
          hips: '',
          shoe_size: '',
          instagram: '',
          tiktok: ''
        });
        setPhotos({
          photo_1: null,
          photo_2: null,
          photo_3: null,
          photo_4: null,
          photo_5: null
        });

        // Reset PhotoUpload components by changing key
        setFormKey(prev => prev + 1);

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.data.message,
          errors: result.data.errors
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: 'An error occurred while submitting the form. Please try again.'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper title={page?.title?.rendered || "Casting"}>
      <div className="max-w-4xl mx-auto py-10">
        {/* Introduction */}
        <div className="mb-10 text-gray-300">
          <p className="mb-4">
            Thank you for your interest in joining Mannequin Studio. Please complete the form below
            and upload the required photos. We will review your submission and contact you soon.
          </p>
          <p className="text-sm text-gray-400">
            All fields marked with <span className="text-red-400">*</span> are required.
          </p>
        </div>

        {/* Status Messages */}
        {submitStatus && (
          <div
            className={`mb-8 p-4 rounded ${
              submitStatus.type === 'success'
                ? 'bg-green-900/30 border border-green-600 text-green-300'
                : 'bg-red-900/30 border border-red-600 text-red-300'
            }`}
          >
            <p className="font-semibold mb-2">{submitStatus.message}</p>
            {submitStatus.errors && submitStatus.errors.length > 0 && (
              <ul className="list-disc list-inside text-sm">
                {submitStatus.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-semibold mb-6 text-gray-900">Personal Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    Full Name <span className="text-red-400">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-3 bg-transparent border-b-2 ${
                    fieldErrors.name ? 'border-red-500' : 'border-gray-300'
                  } text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-800 transition-colors`}
                  placeholder="Your full name"
                />
                {fieldErrors.name && (
                  <p className="text-sm text-red-400 mt-1">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    Email <span className="text-red-400">*</span>
                  </span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-3 bg-transparent border-b-2 ${
                    fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                  } text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-800 transition-colors`}
                  placeholder="your.email@example.com"
                />
                {fieldErrors.email && (
                  <p className="text-sm text-red-400 mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    Phone Number <span className="text-red-400">*</span>
                  </span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-3 bg-transparent border-b-2 ${
                    fieldErrors.phone ? 'border-red-500' : 'border-gray-300'
                  } text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-800 transition-colors`}
                  placeholder="+65 1234 5678"
                />
                {fieldErrors.phone && (
                  <p className="text-sm text-red-400 mt-1">{fieldErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    Gender <span className="text-red-400">*</span>
                  </span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-3 bg-transparent border-b-2 ${
                    fieldErrors.gender ? 'border-red-500' : 'border-gray-300'
                  } text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-800 transition-colors`}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {fieldErrors.gender && (
                  <p className="text-sm text-red-400 mt-1">{fieldErrors.gender}</p>
                )}
              </div>
            </div>
          </section>

          {/* Physical Attributes */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-semibold mb-6 text-gray-900">Physical Attributes</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    Hair Color <span className="text-red-400">*</span>
                  </span>
                </label>
                <select
                  name="hair_color"
                  value={formData.hair_color}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-3 bg-transparent border-b-2 ${
                    fieldErrors.hair_color ? 'border-red-500' : 'border-gray-300'
                  } text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-800 transition-colors`}
                >
                  <option value="">Select hair color</option>
                  <option value="Auburn">Auburn</option>
                  <option value="Black">Black</option>
                  <option value="Blonde">Blonde</option>
                  <option value="Brown">Brown</option>
                  <option value="Red">Red</option>
                  <option value="Grey">Grey</option>
                  <option value="White">White</option>
                  <option value="Other">Other</option>
                </select>
                {fieldErrors.hair_color && (
                  <p className="text-sm text-red-400 mt-1">{fieldErrors.hair_color}</p>
                )}
              </div>

              <div>
                <label className="block mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    Eye Color <span className="text-red-400">*</span>
                  </span>
                </label>
                <select
                  name="eye_color"
                  value={formData.eye_color}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-3 bg-transparent border-b-2 ${
                    fieldErrors.eye_color ? 'border-red-500' : 'border-gray-300'
                  } text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-800 transition-colors`}
                >
                  <option value="">Select eye color</option>
                  <option value="Blue">Blue</option>
                  <option value="Green">Green</option>
                  <option value="Hazel">Hazel</option>
                  <option value="Brown">Brown</option>
                  <option value="Grey">Grey</option>
                  <option value="Amber">Amber</option>
                </select>
                {fieldErrors.eye_color && (
                  <p className="text-sm text-red-400 mt-1">{fieldErrors.eye_color}</p>
                )}
              </div>
            </div>
          </section>

          {/* Measurements */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-semibold mb-6 text-gray-900">Measurements</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    Height <span className="text-red-400">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-3 bg-transparent border-b-2 ${
                    fieldErrors.height ? 'border-red-500' : 'border-gray-300'
                  } text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-800 transition-colors`}
                  placeholder="e.g., 5'8&quot; or 173cm"
                />
                {fieldErrors.height && (
                  <p className="text-sm text-red-400 mt-1">{fieldErrors.height}</p>
                )}
              </div>

              <div>
                <label className="block mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    Bust <span className="text-red-400">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="bust"
                  value={formData.bust}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-3 bg-transparent border-b-2 ${
                    fieldErrors.bust ? 'border-red-500' : 'border-gray-300'
                  } text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-800 transition-colors`}
                  placeholder="e.g., 34&quot; or 86cm"
                />
                {fieldErrors.bust && (
                  <p className="text-sm text-red-400 mt-1">{fieldErrors.bust}</p>
                )}
              </div>

              <div>
                <label className="block mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    Waist <span className="text-red-400">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="waist"
                  value={formData.waist}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-3 bg-transparent border-b-2 ${
                    fieldErrors.waist ? 'border-red-500' : 'border-gray-300'
                  } text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-800 transition-colors`}
                  placeholder="e.g., 26&quot; or 66cm"
                />
                {fieldErrors.waist && (
                  <p className="text-sm text-red-400 mt-1">{fieldErrors.waist}</p>
                )}
              </div>

              <div>
                <label className="block mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    Hips <span className="text-red-400">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="hips"
                  value={formData.hips}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-3 bg-transparent border-b-2 ${
                    fieldErrors.hips ? 'border-red-500' : 'border-gray-300'
                  } text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-800 transition-colors`}
                  placeholder="e.g., 36&quot; or 91cm"
                />
                {fieldErrors.hips && (
                  <p className="text-sm text-red-400 mt-1">{fieldErrors.hips}</p>
                )}
              </div>

              <div>
                <label className="block mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    Shoe Size <span className="text-red-400">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="shoe_size"
                  value={formData.shoe_size}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-3 bg-transparent border-b-2 ${
                    fieldErrors.shoe_size ? 'border-red-500' : 'border-gray-300'
                  } text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-800 transition-colors`}
                  placeholder="e.g., 9 US or 40 EU"
                />
                {fieldErrors.shoe_size && (
                  <p className="text-sm text-red-400 mt-1">{fieldErrors.shoe_size}</p>
                )}
              </div>
            </div>
          </section>

          {/* Social Media */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-semibold mb-6 text-gray-900">Social Media</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2">
                  <span className="text-sm font-semibold text-gray-900">Instagram Handle</span>
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  className="w-full px-2 py-3 bg-transparent border-b-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-800 transition-colors"
                  placeholder="@yourusername"
                />
              </div>

              <div>
                <label className="block mb-2">
                  <span className="text-sm font-semibold text-gray-900">TikTok Handle</span>
                </label>
                <input
                  type="text"
                  name="tiktok"
                  value={formData.tiktok}
                  onChange={handleInputChange}
                  className="w-full px-2 py-3 bg-transparent border-b-2 border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-800 transition-colors"
                  placeholder="@yourusername"
                />
              </div>
            </div>
          </section>

          {/* Photos */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-semibold mb-6 text-gray-900">Required Photos</h2>
            <p className="text-sm text-gray-400 mb-6">
              Please upload all 5 required photos. Each photo must be under 5MB and in JPG, JPEG, or GIF format.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <PhotoUpload
                key={`photo_1_${formKey}`}
                name="photo_1"
                label="Photo 1: Mid-length Shot"
                description="Waist-up photo showing your natural pose"
                onChange={handlePhotoChange}
                error={photoErrors.photo_1}
              />

              <PhotoUpload
                key={`photo_2_${formKey}`}
                name="photo_2"
                label="Photo 2: Close-up (Hair Down, Smiling)"
                description="Headshot with hair down, smiling and showing teeth"
                onChange={handlePhotoChange}
                error={photoErrors.photo_2}
              />

              <PhotoUpload
                key={`photo_3_${formKey}`}
                name="photo_3"
                label="Photo 3: Close-up (Hair Up, Neutral)"
                description="Headshot with hair up, neutral expression (no smile)"
                onChange={handlePhotoChange}
                error={photoErrors.photo_3}
              />

              <PhotoUpload
                key={`photo_4_${formKey}`}
                name="photo_4"
                label="Photo 4: Full Length"
                description="Full body shot in regular clothing"
                onChange={handlePhotoChange}
                error={photoErrors.photo_4}
              />

              <PhotoUpload
                key={`photo_5_${formKey}`}
                name="photo_5"
                label="Photo 5: Full Length (Swimwear)"
                description="Full body shot in bikini or swimwear"
                onChange={handlePhotoChange}
                error={photoErrors.photo_5}
              />
            </div>
          </section>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <ButtonPrimary
              type="submit"
              disabled={isSubmitting}
              className="px-12 py-4 rounded-lg font-semibold text-lg"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </ButtonPrimary>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
};

export default Casting;
