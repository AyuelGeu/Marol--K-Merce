const { Client } = require("@googlemaps/google-maps-services-js");
const googleMapsClient = new Client({});
const VendorApplication = require("../models/VendorApplication"); // Adjust to your model name/path

const submitVendorApplication = async (req, res) => {
  try {
    const {
      name,
      email,
      storeName,
      storeDescription,
      password,
      contactNumber,
      storeAddress,
      storeCategory,
      location
    } = req.body;

    let finalLocation = location;

    // If the user entered a store address but didn't pin it or we want to back it up with server geocoding:
    if (storeAddress && (!location || !location.coordinates || (location.coordinates[0] === 36.8219 && location.coordinates[1] === 1.2921))) {
      try {
        const geoResponse = await googleMapsClient.geocode({
          params: {
            address: storeAddress,
            key: process.env.GOOGLE_MAPS_API_KEY,
          },
        });

        if (geoResponse.data.results.length > 0) {
          const { lat, lng } = geoResponse.data.results[0].geometry.location;
          // Format as MongoDB GeoJSON: [longitude, latitude]
          finalLocation = {
            type: 'Point',
            coordinates: [lng, lat]
          };
        }
      } catch (geocodeError) {
        console.error("Geocoding fallback failed:", geocodeError.message);
        // Proceeds with default/client location if geocoding fails
      }
    }

    // Create and save the application to your database
    const newApplication = new VendorApplication({
      name,
      email,
      storeName,
      storeDescription,
      password, // Remember to hash your password securely with bcrypt before saving!
      contactNumber,
      storeAddress,
      storeCategory,
      location: finalLocation
    });

    await newApplication.save();

    return res.status(201).json({
      success: true,
      email: newApplication.email,
      message: "Vendor application submitted successfully."
    });

  } catch (error) {
    console.error("Vendor Application Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error during application submission."
    });
  }
};

module.exports = { submitVendorApplication };