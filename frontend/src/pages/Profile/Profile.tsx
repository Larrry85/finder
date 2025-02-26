import React, { FormEvent, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ProfileHeader from "../../components/Profile/ProfileHeader";
import ProfilePhoto from "../../components/Profile/ProfilePhoto";
import FormField from "../../components/Profile/FormField";
import ActionButtons from "../../components/Profile/ActionButtons";
import { ProfileFormState } from "../../components/Profile/types";
import { initialFormData } from "../../components/Profile/types";
import ProjectSelection from "../../components/Profile/ProjectSelection";
import MeCard from "../../components/Profile/Mecard";
import { MeProfileCard } from "../../components/Profile/types";

import axios from "axios";
import { GiConsoleController } from "react-icons/gi";

const Profile: React.FC = () => {
  const [view, setView] = useState<"profile" | "meCard">("profile");
  const [cities, setCities] = useState([]);
  const navigate = useNavigate();
  const [savedData, setSavedData] = useState<ProfileFormState | null>(null);
  const [formData, setFormData] = useState<ProfileFormState>(initialFormData);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSecurityWord, setShowSecurityWord] = useState(false);
  const [meCardData, setMeCardData] = useState<MeProfileCard | null>(null); // State to store profile card data
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProfileFormState, string>>
  >({});

  const getToken = useCallback(() => {
    const localToken = localStorage.getItem("token");
    const sessionToken = sessionStorage.getItem("token");
    return localToken || sessionToken;
  }, []);

  //console.log("LocalToken in profile.tsx1", localStorage.getItem("token"));
  //console.log("SessionTokenn in profile.tsx1", sessionStorage.getItem("token"));

  const handleSubmitWrapper = async () => {
    const fakeEvent = {
      preventDefault: () => {},
    } as FormEvent<HTMLFormElement>;

    await handleSubmit(fakeEvent);
  };

  const getImageUrl = useCallback((filename: string | null) => {
    if (!filename) return "";
    const cleanFilename = filename.replace(
      /^(uploads\/|\/uploads\/|uploads\\|\\uploads\\)/,
      ""
    );
    return `http://localhost:8080/uploads/${cleanFilename}`;
  }, []);

  const parseDate = (dateString: string | null): string => {
    if (!dateString) return "";

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return dateString;
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return "";
    }
  };

  const validateForm = useCallback(() => {
    const newErrors: Partial<Record<keyof ProfileFormState, string>> = {};

    if (!formData.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.securityQuestion?.trim()) {
      newErrors.securityQuestion = "Security word is required";
    }
    if (formData.birthDate) {
      const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
      if (!dateRegex.test(formData.birthDate)) {
        newErrors.birthDate = "Invalid date format. Use dd/mm/yyyy";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (formData.readOnly) return;
    const { name, value } = e.target;

    if (name === "interests") {
      const formattedValue = value.replace(/,(?!\s)/g, ", ");
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (name === "birthDate") {
      const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
      if (value && !dateRegex.test(value)) {
        setErrors((prev) => ({
          ...prev,
          birthDate: "Invalid date format, please use dd/mm/yyyy",
        }));
      } else {
        setErrors((prev) => ({ ...prev, birthDate: undefined }));
      }
    }
  };

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/cities");
        if (response.ok) {
          const data = await response.json();
          setCities(data);
        } else {
          console.log("error fetching cities")
        }
      } catch (error) {
        console.error("erroe fetching cities:", error)
      }
    };
    fetchCities();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      return;
    }

    setProfilePicture(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  };

  const removeProfilePicture = async () => {
    const token = getToken();
    if (!token) return;

    try {
    await axios.delete(
        "http://localhost:8080/api/profile/update",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            removeProfilePicture: "true",
          },
        }
      );

      //console.log("Response from server:", response);

      // Update the frontend state after a successful backend removal
      setProfilePicture(null); // Reset the profile picture state
      setPreviewUrl(null); // Clear the preview URL
      setFormData((prev) => ({
        ...prev,
        profilePicture: null,
      }));
    } catch (error) {
      console.error("Failed to remove profile picture:", error);
    }
  };

  const checkAuth = useCallback(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return false;
    }
    return token;
  }, [getToken, navigate]);

  const fetchProfileData = async () => {
    const token = checkAuth();
    if (!token) return;

    try {
      const response = await axios.get(
        "http://localhost:8080/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const profileData = response.data;

      const processedData = {
        ...profileData,
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        email: profileData.email || "",
        username: profileData.username || "",
        birthDate: profileData.birthDate
          ? parseDate(profileData.birthDate)
          : "",
        gender: profileData.gender || "",
        age: profileData.age || "",
        locationCity: profileData.locationCity || "",
        discord: profileData.discord || "",
        myprojects: profileData.myprojects || "",
        biography: profileData.biography || "",
        interests: Array.isArray(profileData.interests)
          ? profileData.interests.join(", ")
          : "",
        securityQuestion: profileData.securityQuestion || "",
        golangProjects: profileData.golangProjects || [],
        javascriptProjects: profileData.javascriptProjects || [],
      };

      if (profileData.profilePicture) {
        const imageUrl = getImageUrl(profileData.profilePicture);
        processedData.profilePicture = imageUrl;
        setPreviewUrl(imageUrl);
      } else {
        setProfilePicture(null);
        setPreviewUrl(null);
      }

      setSavedData(processedData);
      setFormData(processedData);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        navigate("/login");
        return;
      }
      setSavedData(null);
      setFormData(initialFormData);
    }
  };

  const fetchMeCardData = async () => {
    const token = checkAuth();
    if (!token) return;

    try {
      const response = await axios.get(
        "http://localhost:8080/api/users/me/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const profileData = response.data;

      const processedData: MeProfileCard = {
        ...profileData,
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        birthDate: profileData.birthDate
          ? parseDate(profileData.birthDate)
          : "",
        gender: profileData.gender || "",
        age: profileData.age || 0,
        locationCity: profileData.locationCity || "",
        biography: profileData.biography || "",
        discord: profileData.discord || "",
        myprojects: profileData.myprojects || "",
        interests: Array.isArray(profileData.interests)
          ? profileData.interests
          : [],
        maxDistancePreference: profileData.maxDistancePreference || 0,
        profilePicture: profileData.profilePicture || "",
        golangProjects: profileData.golangProjects || [],
        javascriptProjects: profileData.javascriptProjects || [],
      };

      if (profileData.profilePicture) {
        const imageUrl = getImageUrl(profileData.profilePicture);
        processedData.profilePicture = imageUrl;
      }

      setMeCardData(processedData);
      setView("meCard");
    } catch (error: any) {
      console.error("Error fetching profile card data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        navigate("/login");
        return;
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = checkAuth();
    if (!token) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    const submitData = new FormData();

    submitData.append("firstName", formData.firstName || "");
    submitData.append("lastName", formData.lastName || "");
    submitData.append("birthDate", formData.birthDate || "");
    submitData.append("age", formData.age ? formData.age : "");
    submitData.append("gender", formData.gender || "");
    submitData.append("biography", formData.biography || "");
    submitData.append("discord", formData.discord || "");
    submitData.append("myprojects", formData.myprojects || "");
    submitData.append("locationCity", formData.locationCity || "");
    submitData.append(
      "maxDistancePreference",
      formData.maxDistancePreference?.toString() || ""
    );
    submitData.append(
      "interests",
      JSON.stringify(
        formData.interests
          .toString()
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean)
      )
    );
    submitData.append(
      "golangProjects",
      JSON.stringify(formData.golangProjects)
    );
    submitData.append(
      "javascriptProjects",
      JSON.stringify(formData.javascriptProjects)
    );

    if (profilePicture) {
      submitData.append("profilePicture", profilePicture);
    } else {
      submitData.append("profilePicture", "");
    }

    submitData.append("securityQuestion", formData.securityQuestion);

    try {
      const response = await fetch("http://localhost:8080/api/profile/update", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!response.ok) throw new Error(await response.text());

      const updatedProfile = await response.json();
      setSavedData(updatedProfile);
      await fetchProfileData();
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to save profile: ${error.message}`);
      } else {
        console.error("Failed to save profile");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const token = checkAuth();
    if (token) {
      fetchProfileData();
    }
  }, [checkAuth]);

  const handleCancel = () => {
    setFormData(savedData || initialFormData);
    if (!savedData?.profilePicture) {
      setProfilePicture(null);
      setPreviewUrl(null);
    }
    setErrors({});
  };

  useEffect(() => {
    const token = checkAuth();
    if (token) {
      fetchProfileData();
    }
  }, [checkAuth]);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row min-h-screen bg-[#1a1b26]"
    >
      {/* Sidebar - Hide on mobile, show on md and up */}
      <div className="hidden md:block w-64 bg-[#1a1b26]">
        <Navbar />
      </div>

      {/* Mobile navbar - Show on mobile, hide on md and up */}
      <div className="md:hidden w-full bg-[#1a1b26]">
        <Navbar />
      </div>

      <div className="flex-1">
        <div className="w-full bg-[#272735] min-h-screen">
          <ProfileHeader />
          <div className="p-4 md:p-6 max-w-4xl mx-auto">
            {view === "profile" && (
              <>
                <ProfilePhoto
                  previewUrl={previewUrl}
                  onImageChange={handleImageChange}
                />
                <div className="space-y-6 md:space-y-8">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-200">
                      Email
                    </label>
                    <div className="text-gray-400 break-all">
                      {savedData?.email || "Email not available"}
                    </div>
                    <label className="block text-sm font-semibold text-gray-200 mt-2">
                      Username
                    </label>
                    <div className="text-gray-400 break-all">
                      {savedData?.username || "Username not available"}
                    </div>
                  </div>

                  {/* Form Grid - Stack on mobile, 2 columns on tablet and up */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    {/* Form fields remain the same but will now stack responsively */}
                    <FormField
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      error={errors.firstName}
                      placeholder="Enter your first name"
                    />
                    <FormField
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      error={errors.lastName}
                      placeholder="Enter your last name"
                    />
                    <FormField
                      label="Birth Date"
                      name="birthDate"
                      type="text"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      required
                      error={errors.birthDate}
                      placeholder="dd/mm/yyyy"
                    />
                    <FormField
                      label="Gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      as="select"
                      options={[
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                        { value: "other", label: "Other" },
                      ]}
                      placeholder="Select gender"
                    />
                    <FormField
                      label="Choose city"
                      name="locationCity"
                      value={formData.locationCity}
                      onChange={handleInputChange}
                      required
                      as="select"
                      options={cities.map((city) => ({
                        value: city,
                        label: city,
                      }))}
                      placeholder="Select City"
                    />
                    <div className="flex items-center space-x-2">
                      <FormField
                        label="Security Word"
                        name="securityQuestion"
                        type={showSecurityWord ? "text" : "password"}
                        value={formData.securityQuestion}
                        onChange={handleInputChange}
                        required
                        error={errors.securityQuestion}
                        placeholder="Security word for password reset"
                      />
                      <button
                        type="button"
                        className="bg-[#b085f5] text-white px-3 py-1 rounded-md hover:bg-[#9c5fd7] transition-all duration-200"
                        onClick={() => setShowSecurityWord(!showSecurityWord)}
                        style={{ marginTop: "33px" }}
                        aria-label={
                          showSecurityWord
                            ? "Hide security word"
                            : "Show security word"
                        }
                      >
                        {showSecurityWord ? "🙈" : "👁️"}
                      </button>
                    </div>
                    <FormField
                      label="My projects url (only friends see)"
                      name="myprojects"
                      type="url"
                      value={formData.myprojects || ""}
                      onChange={handleInputChange}
                      placeholder="Enter your projects link"
                    />
                    <FormField
                      label="Discord (only friends see)"
                      name="discord"
                      value={formData.discord}
                      onChange={handleInputChange}
                      placeholder="Enter your discord name"
                    />
                    {/* Biography section - Full width on all screens */}
                    <div className="col-span-full">
                      <FormField
                        label="Biography"
                        name="biography"
                        value={formData.biography}
                        onChange={handleInputChange}
                        as="textarea"
                        rows={4}
                        placeholder="Tell us about yourself"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[#b085f5] text-sm font-medium">
                        Coding Skills
                      </label>
                      <textarea
                        name="interests"
                        value={formData.interests}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-[#1a1b26] text-white border border-[#383850] rounded-lg focus:ring-2 focus:ring-[#b085f5] transition-all duration-200"
                        placeholder="Enter coding strengths (e.g., Javascript, match-me, React...)"
                        rows={4}
                      />
                      <ProjectSelection
                        selectedProjects={{
                          golangProjects: formData.golangProjects,
                          javascriptProjects: formData.javascriptProjects,
                        }}
                        onChange={(newProjects) => {
                          setFormData((prev) => ({
                            ...prev,
                            golangProjects: newProjects.golangProjects,
                            javascriptProjects: newProjects.javascriptProjects,
                          }));
                        }}
                      />
                    </div>
                  </div>

                  {/* Action buttons - Stack on mobile, row on tablet and up */}
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <ActionButtons
                      isSubmitting={isSubmitting}
                      onCancel={handleCancel}
                      currentData={formData}
                      savedData={savedData}
                      profilePicture={profilePicture}
                      onSubmit={handleSubmitWrapper}
                    />
                    <div className="flex flex-col md:flex-row gap-3">
                      <button
                        type="button"
                        className="w-full md:w-auto bg-[#b085f5] h-12 text-white px-4 py-2 rounded-md hover:bg-[#9c5fd7] transition-all duration-200"
                        onClick={removeProfilePicture}
                      >
                        Remove Profile Picture
                      </button>
                      <button
                        type="button"
                        className="w-full md:w-auto bg-[#b085f5] h-12 text-white px-4 py-2 rounded-md hover:bg-[#9c5fd7] transition-all duration-200"
                        onClick={fetchMeCardData}
                      >
                        Show My Profile Card
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {view === "meCard" && meCardData && (
              <div className="p-4">
                <button
                  type="button"
                  className="w-full md:w-auto mb-4 bg-[#b085f5] text-white px-4 py-2 rounded-md hover:bg-[#9c5fd7] transition-all duration-200"
                  onClick={() => setView("profile")}
                >
                  Back to Edit Profile Page
                </button>
                <MeCard me={meCardData} />
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default Profile;
