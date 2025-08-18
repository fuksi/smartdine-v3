import React, { useState, useEffect } from "react";
import {
  parsePhoneNumber,
  AsYouType,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";

interface PhoneInputProps {
  value: string;
  onChange: (phoneNumber: string, isValid: boolean) => void;
  defaultCountry?: string;
  placeholder?: string;
  className?: string;
}

const countryNames: Record<string, string> = {
  FI: "Finland",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  IT: "Italy",
  NL: "Netherlands",
  BE: "Belgium",
  AT: "Austria",
  CH: "Switzerland",
  CA: "Canada",
  AU: "Australia",
  JP: "Japan",
  CN: "China",
  IN: "India",
  BR: "Brazil",
};

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  defaultCountry = "FI",
  placeholder = "Phone number",
  className = "",
}) => {
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [phoneInput, setPhoneInput] = useState("");

  // Initialize phone input when value prop changes
  useEffect(() => {
    if (value) {
      try {
        const parsed = parsePhoneNumber(value);
        if (parsed) {
          setSelectedCountry(parsed.country || defaultCountry);
          setPhoneInput(parsed.nationalNumber);
        }
      } catch {
        // If parsing fails, just use the raw value
        setPhoneInput(value);
      }
    }
  }, [value, defaultCountry]);

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    formatAndValidatePhone(phoneInput, country);
  };

  const handlePhoneChange = (input: string) => {
    setPhoneInput(input);
    formatAndValidatePhone(input, selectedCountry);
  };

  const formatAndValidatePhone = (input: string, country: string) => {
    try {
      const asYouType = new AsYouType(country as CountryCode);
      asYouType.input(input);
      const phoneNumber = asYouType.getNumber();

      if (phoneNumber) {
        const isValid = phoneNumber.isValid();
        const internationalFormat = phoneNumber.format("E.164");
        onChange(internationalFormat, isValid);
      } else {
        onChange(input, false);
      }
    } catch {
      onChange(input, false);
    }
  };

  const getCallingCode = (country: string) => {
    try {
      return `+${getCountryCallingCode(country as CountryCode)}`;
    } catch {
      return "+358"; // Default to Finland
    }
  };

  const popularCountries = ["FI", "SE", "NO", "DK", "US", "GB", "DE", "FR"];

  return (
    <div className={`flex ${className}`}>
      {/* Country Selector */}
      <select
        value={selectedCountry}
        onChange={(e) => handleCountryChange(e.target.value)}
        className="border border-r-0 border-gray-300 rounded-l-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <optgroup label="Popular">
          {popularCountries.map((country) => (
            <option key={country} value={country}>
              {countryNames[country] || country} ({getCallingCode(country)})
            </option>
          ))}
        </optgroup>
        <optgroup label="Other Countries">
          {Object.entries(countryNames)
            .filter(([code]) => !popularCountries.includes(code))
            .map(([code, name]) => (
              <option key={code} value={code}>
                {name} ({getCallingCode(code)})
              </option>
            ))}
        </optgroup>
      </select>

      {/* Phone Number Input */}
      <input
        type="tel"
        value={phoneInput}
        onChange={(e) => handlePhoneChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 border border-gray-300 rounded-r-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
};
