import React, { useState, useEffect } from "react";
import PageWrapper from "../PageWrapper";
import PhotoUpload from "./PhotoUpload";
import ButtonPrimary from "../ButtonPrimary";
import { fetchPage } from "../../utils/pageUtils";
import { validateEmail, validatePhone, validateRequired } from "../../utils/formValidation";

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  gender: '',
  ethnicity: '',
  hair_colour: '',
  eye_colour: '',
  height: '',
  bust: '',
  chest: '',
  waist: '',
  hip: '',
  collar: '',
  shoe_size: '',
  dress: '',
  suit: '',
  instagram: '',
  tiktok: '',
  youtube: ''
};

const Casting = () => {
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState(initialFormData);

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
  const [submitStatus, setSubmitStatus] = useState(null);
  const [formKey, setFormKey] = useState(0);

  const isFemale = formData.gender === 'Female';
  const isMale = formData.gender === 'Male';

  useEffect(() => {
    const fetchCasting = async () => {
      const response = await fetchPage();
      response.error ? setError(response.content) : setPage(response.content);
    };
    fetchCasting();
  }, []);

  // Warn user before navigating away during submission
  useEffect(() => {
    if (!isSubmitting) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSubmitting]);

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

    // Common required fields
    const requiredFields = {
      name: 'Full Name',
      email: 'Email',
      phone: 'Phone Number',
      gender: 'Gender',
      ethnicity: 'Ethnicity',
      hair_colour: 'Hair Colour',
      eye_colour: 'Eye Colour',
      height: 'Height',
      waist: 'Waist',
      shoe_size: 'Shoe Size'
    };

    // Gender-specific required fields
    if (isFemale) {
      requiredFields.bust = 'Bust';
      requiredFields.hip = 'Hip';
      requiredFields.dress = 'Dress';
    } else if (isMale) {
      requiredFields.chest = 'Chest';
      requiredFields.collar = 'Collar';
      requiredFields.suit = 'Suit';
    }

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

    const hasErrors = Object.keys(errors).length > 0 || Object.keys(pErrors).length > 0;
    if (hasErrors) {
      console.error('Casting form validation errors:', { fieldErrors: errors, photoErrors: pErrors });
    }

    return !hasErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitStatus(null);

    if (!validateForm()) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fix the highlighted fields before submitting.'
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    const submitData = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });

    Object.entries(photos).forEach(([key, file]) => {
      if (file) {
        submitData.append(`photos[${key}]`, file);
      }
    });

    const nonce = window.mannequinStudioOptions?.castingNonce;
    if (nonce) {
      submitData.append('nonce', nonce);
    }

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

        setFormData(initialFormData);
        setPhotos({
          photo_1: null,
          photo_2: null,
          photo_3: null,
          photo_4: null,
          photo_5: null
        });

        setFormKey(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        console.error('Casting form submission error:', result.data.message, result.data.errors || []);
        setSubmitStatus({
          type: 'error',
          message: 'Something went wrong. Please try again or contact us directly.'
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

  const inputClass = (field) =>
    `w-full px-2 py-3 bg-transparent border-b-2 ${
      fieldErrors[field] ? 'border-red-500' : 'border-gray-300'
    } text-gray-900 placeholder-gray-500 outline-none ring-0 shadow-none focus:outline-none focus:ring-0 focus:shadow-none focus:border-gray-800 transition-colors`;

  const FieldError = ({ field }) =>
    fieldErrors[field] ? <p className="text-sm text-red-400 mt-1">{fieldErrors[field]}</p> : null;

  const RequiredLabel = ({ children }) => (
    <label className="block mb-2">
      <span className="text-sm font-semibold text-gray-900">
        {children} <span className="text-red-400">*</span>
      </span>
    </label>
  );

  const OptionalLabel = ({ children }) => (
    <label className="block mb-2">
      <span className="text-sm font-semibold text-gray-900">{children}</span>
    </label>
  );

  return (
    <PageWrapper title={page?.title?.rendered || "Casting"}>
      {/* Submission overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-8 mx-4 max-w-sm w-full text-center">
            <svg className="animate-spin h-10 w-10 text-gray-700 mx-auto mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-lg font-semibold text-gray-900 mb-2">Uploading your application...</p>
            <p className="text-sm text-gray-500">Please do not close or navigate away from this page.</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
        {/* Introduction */}
        <div className="mb-10 text-gray-700">
          <p className="mb-4">
            Thank you for your interest in joining Mannequin Studio. Please complete the form below
            and upload the required photos. We will review your submission and contact you soon.
          </p>
          <p className="text-sm text-gray-600">
            All fields marked with <span className="text-red-400">*</span> are required.
          </p>
        </div>

        {/* Status Messages */}
        {submitStatus && (
          <div
            className={`mb-8 p-4 rounded ${
              submitStatus.type === 'success'
                ? 'bg-green-50 border border-green-500 text-green-800'
                : 'bg-red-50 border border-red-500 text-red-800'
            }`}
          >
            <p className="font-semibold">{submitStatus.message}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-semibold mb-6 text-gray-900">Personal Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <RequiredLabel>Full Name</RequiredLabel>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={inputClass('name')}
                  placeholder="Your full name"
                />
                <FieldError field="name" />
              </div>

              <div>
                <RequiredLabel>Email</RequiredLabel>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={inputClass('email')}
                  placeholder="your.email@example.com"
                />
                <FieldError field="email" />
              </div>

              <div>
                <RequiredLabel>Phone Number</RequiredLabel>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={inputClass('phone')}
                  placeholder="+65 1234 5678"
                />
                <FieldError field="phone" />
              </div>

              <div>
                <RequiredLabel>Gender</RequiredLabel>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={inputClass('gender')}
                >
                  <option value="">Select gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
                <FieldError field="gender" />
              </div>

              <div>
                <RequiredLabel>Ethnicity</RequiredLabel>
                <select
                  name="ethnicity"
                  value={formData.ethnicity}
                  onChange={handleInputChange}
                  className={inputClass('ethnicity')}
                >
                  <option value="">Select ethnicity</option>
                  <option value="Asian & Eurasian">Asian & Eurasian</option>
                  <option value="Caucasian">Caucasian</option>
                </select>
                <FieldError field="ethnicity" />
              </div>
            </div>
          </section>

          {/* Physical Attributes */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-semibold mb-6 text-gray-900">Physical Attributes</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <RequiredLabel>Hair Colour</RequiredLabel>
                <input
                  type="text"
                  name="hair_colour"
                  value={formData.hair_colour}
                  onChange={handleInputChange}
                  className={inputClass('hair_colour')}
                  placeholder="e.g., Black, Brown, Blonde"
                />
                <FieldError field="hair_colour" />
              </div>

              <div>
                <RequiredLabel>Eye Colour</RequiredLabel>
                <input
                  type="text"
                  name="eye_colour"
                  value={formData.eye_colour}
                  onChange={handleInputChange}
                  className={inputClass('eye_colour')}
                  placeholder="e.g., Brown, Blue, Green"
                />
                <FieldError field="eye_colour" />
              </div>
            </div>
          </section>

          {/* Measurements */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-semibold mb-6 text-gray-900">Measurements</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <RequiredLabel>Height</RequiredLabel>
                <input
                  type="text"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className={inputClass('height')}
                  placeholder="e.g., 5'8&quot; or 173cm"
                />
                <FieldError field="height" />
              </div>

              {/* Female: Bust */}
              {isFemale && (
                <div>
                  <RequiredLabel>Bust</RequiredLabel>
                  <input
                    type="text"
                    name="bust"
                    value={formData.bust}
                    onChange={handleInputChange}
                    className={inputClass('bust')}
                    placeholder="e.g., 34&quot; or 86cm"
                  />
                  <FieldError field="bust" />
                </div>
              )}

              {/* Male: Chest */}
              {isMale && (
                <div>
                  <RequiredLabel>Chest</RequiredLabel>
                  <input
                    type="text"
                    name="chest"
                    value={formData.chest}
                    onChange={handleInputChange}
                    className={inputClass('chest')}
                    placeholder="e.g., 38&quot; or 96cm"
                  />
                  <FieldError field="chest" />
                </div>
              )}

              <div>
                <RequiredLabel>Waist</RequiredLabel>
                <input
                  type="text"
                  name="waist"
                  value={formData.waist}
                  onChange={handleInputChange}
                  className={inputClass('waist')}
                  placeholder="e.g., 26&quot; or 66cm"
                />
                <FieldError field="waist" />
              </div>

              {/* Female: Hip */}
              {isFemale && (
                <div>
                  <RequiredLabel>Hip</RequiredLabel>
                  <input
                    type="text"
                    name="hip"
                    value={formData.hip}
                    onChange={handleInputChange}
                    className={inputClass('hip')}
                    placeholder="e.g., 36&quot; or 91cm"
                  />
                  <FieldError field="hip" />
                </div>
              )}

              {/* Male: Collar */}
              {isMale && (
                <div>
                  <RequiredLabel>Collar</RequiredLabel>
                  <input
                    type="text"
                    name="collar"
                    value={formData.collar}
                    onChange={handleInputChange}
                    className={inputClass('collar')}
                    placeholder="e.g., 15.5&quot; or 39cm"
                  />
                  <FieldError field="collar" />
                </div>
              )}

              <div>
                <RequiredLabel>Shoe Size</RequiredLabel>
                <input
                  type="text"
                  name="shoe_size"
                  value={formData.shoe_size}
                  onChange={handleInputChange}
                  className={inputClass('shoe_size')}
                  placeholder="e.g., 9 US or 40 EU"
                />
                <FieldError field="shoe_size" />
              </div>

              {/* Female: Dress */}
              {isFemale && (
                <div>
                  <RequiredLabel>Dress</RequiredLabel>
                  <input
                    type="text"
                    name="dress"
                    value={formData.dress}
                    onChange={handleInputChange}
                    className={inputClass('dress')}
                    placeholder="e.g., S, M, 8, 10"
                  />
                  <FieldError field="dress" />
                </div>
              )}

              {/* Male: Suit */}
              {isMale && (
                <div>
                  <RequiredLabel>Suit</RequiredLabel>
                  <input
                    type="text"
                    name="suit"
                    value={formData.suit}
                    onChange={handleInputChange}
                    className={inputClass('suit')}
                    placeholder="e.g., 38R, 40L"
                  />
                  <FieldError field="suit" />
                </div>
              )}
            </div>
          </section>

          {/* Social Media */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-semibold mb-6 text-gray-900">Social Media</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <OptionalLabel>Instagram</OptionalLabel>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  className="w-full px-2 py-3 bg-transparent border-b-2 border-gray-300 text-gray-900 placeholder-gray-500 outline-none ring-0 shadow-none focus:outline-none focus:ring-0 focus:shadow-none focus:border-gray-800 transition-colors"
                  placeholder="@yourusername"
                />
              </div>

              <div>
                <OptionalLabel>TikTok</OptionalLabel>
                <input
                  type="text"
                  name="tiktok"
                  value={formData.tiktok}
                  onChange={handleInputChange}
                  className="w-full px-2 py-3 bg-transparent border-b-2 border-gray-300 text-gray-900 placeholder-gray-500 outline-none ring-0 shadow-none focus:outline-none focus:ring-0 focus:shadow-none focus:border-gray-800 transition-colors"
                  placeholder="@yourusername"
                />
              </div>

              <div>
                <OptionalLabel>YouTube</OptionalLabel>
                <input
                  type="text"
                  name="youtube"
                  value={formData.youtube}
                  onChange={handleInputChange}
                  className="w-full px-2 py-3 bg-transparent border-b-2 border-gray-300 text-gray-900 placeholder-gray-500 outline-none ring-0 shadow-none focus:outline-none focus:ring-0 focus:shadow-none focus:border-gray-800 transition-colors"
                  placeholder="Channel URL or name"
                />
              </div>
            </div>
          </section>

          {/* Photos */}
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-3xl font-semibold mb-6 text-gray-900">Required Photos</h2>
            <p className="text-sm text-gray-400 mb-6">
              Please upload all 5 required photos. Each photo must be under 5MB.
            </p>

            <div className="space-y-6">
              {/* Row 1: Mid-length */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                <PhotoUpload
                  key={`photo_1_${formKey}`}
                  name="photo_1"
                  label="Mid-length Shot"
                  description="Waist-up photo showing your natural pose"
                  onChange={handlePhotoChange}
                  error={photoErrors.photo_1}
                />
              </div>

              {/* Row 2: Close-ups */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                <PhotoUpload
                  key={`photo_2_${formKey}`}
                  name="photo_2"
                  label="Close-up (Hair Down, Smiling)"
                  description="Headshot with hair down, smiling and showing teeth"
                  onChange={handlePhotoChange}
                  error={photoErrors.photo_2}
                />
                <PhotoUpload
                  key={`photo_3_${formKey}`}
                  name="photo_3"
                  label="Close-up (Hair Up, Neutral)"
                  description="Headshot with hair up, neutral expression (no smile)"
                  onChange={handlePhotoChange}
                  error={photoErrors.photo_3}
                />
              </div>

              {/* Row 3: Full lengths */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                <PhotoUpload
                  key={`photo_4_${formKey}`}
                  name="photo_4"
                  label="Full Length"
                  description="Full body shot in regular clothing"
                  onChange={handlePhotoChange}
                  error={photoErrors.photo_4}
                />
                <PhotoUpload
                  key={`photo_5_${formKey}`}
                  name="photo_5"
                  label="Full Length (Swimwear)"
                  description="Full body shot in bikini or swimwear"
                  onChange={handlePhotoChange}
                  error={photoErrors.photo_5}
                />
              </div>
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
