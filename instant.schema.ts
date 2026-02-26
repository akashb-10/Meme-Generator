import { i } from "@instantdb/react";

export const schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    memes: i.entity({
      title: i.string(),
      imageUrl: i.string(),
      createdAt: i.number(),
      authorId: i.string(),
    }),
    upvotes: i.entity({
      memeId: i.string(),
      userId: i.string(),
    }),
  },
});
