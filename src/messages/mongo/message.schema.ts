import { model, Schema } from "mongoose";
import { ContentType, IMessage } from "../../interfaces";

const MessageSchema = new Schema(
  {
    type: {
      type: String,
      enum: ContentType,
      default: ContentType.Text,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    isBot: {
      type: Boolean,
      default: false,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
    sessionID: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

export const Message = model<IMessage>("Message", MessageSchema);
