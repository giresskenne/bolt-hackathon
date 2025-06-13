import mongoose from 'mongoose';

const usageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{4}-\d{2}$/.test(v);
      },
      message: props => `${props.value} is not a valid month format (YYYY-MM)!`
    }
  },
  scrubCount: {
    type: Number,
    default: 0,
    min: 0
  }
});

// Compound index to ensure one record per user per month
usageSchema.index({ userId: 1, month: 1 }, { unique: true });

// Index for aggregation queries
usageSchema.index({ month: 1 });

const Usage = mongoose.model('Usage', usageSchema);
export default Usage;
