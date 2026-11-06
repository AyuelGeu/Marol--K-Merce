const vendorSchema = new mongoose.Schema({
  // ... your other fields ...
  storeAddress: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }
});

// Create a 2dsphere index for geospatial searches
vendorSchema.index({ location: '2dsphere' });