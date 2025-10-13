import { relations } from "drizzle-orm/relations";

import { MapDifficulties, MapLikes, Maps } from "./map";
import { NotificationOverTakes, Notifications } from "./notification";
import { ImeResults, ResultClaps, ResultStatuses, Results } from "./result";
import {
  UserDailyTypeCounts,
  UserImeTypingOptions,
  UserMapCompletionPlayCounts,
  UserOptions,
  UserProfiles,
  UserStats,
  Users,
  UserTypingOptions,
} from "./user";

export const UsersRelations = relations(Users, ({ many, one }) => {
  return {
    maps: many(Maps, { relationName: "maps_creator" }),
    results: many(Results),
    resultClaps: many(ResultClaps),
    mapLikes: many(MapLikes),
    notificationOverTakesAsVisitor: many(NotificationOverTakes, { relationName: "visitor" }),
    typingOption: one(UserTypingOptions, {
      fields: [Users.id],
      references: [UserTypingOptions.userId],
    }),
    typingStats: one(UserStats, {
      fields: [Users.id],
      references: [UserStats.userId],
    }),
    userOption: one(UserOptions, {
      fields: [Users.id],
      references: [UserOptions.userId],
    }),
    userProfile: one(UserProfiles, {
      fields: [Users.id],
      references: [UserProfiles.userId],
    }),
    userDailyTypeCounts: many(UserDailyTypeCounts),
    userMapCompletionPlayCounts: many(UserMapCompletionPlayCounts),
    userImeTypingOptions: one(UserImeTypingOptions, {
      fields: [Users.id],
      references: [UserImeTypingOptions.userId],
    }),
    imeResults: many(ImeResults),
  };
});

export const MapsRelations = relations(Maps, ({ one, many }) => ({
  creator: one(Users, {
    fields: [Maps.creatorId],
    references: [Users.id],
    relationName: "maps_creator",
  }),
  results: many(Results),
  mapLikes: many(MapLikes),
  notificationOverTakes: many(NotificationOverTakes),
  difficulty: one(MapDifficulties, {
    fields: [Maps.id],
    references: [MapDifficulties.mapId],
  }),
  imeResults: many(ImeResults),
  userMapCompletionPlayCounts: many(UserMapCompletionPlayCounts),
}));

export const MapDifficultiesRelations = relations(MapDifficulties, ({ one }) => ({
  map: one(Maps, {
    fields: [MapDifficulties.mapId],
    references: [Maps.id],
  }),
}));

export const MapLikesRelations = relations(MapLikes, ({ one }) => ({
  user: one(Users, {
    fields: [MapLikes.userId],
    references: [Users.id],
  }),
  map: one(Maps, {
    fields: [MapLikes.mapId],
    references: [Maps.id],
  }),
}));

export const ResultsRelations = relations(Results, ({ one, many }) => ({
  user: one(Users, { fields: [Results.userId], references: [Users.id] }),
  map: one(Maps, { fields: [Results.mapId], references: [Maps.id] }),
  status: one(ResultStatuses, {
    fields: [Results.id],
    references: [ResultStatuses.resultId],
  }),
  claps: many(ResultClaps),
  notificationOverTakesAsVisitor: many(NotificationOverTakes, { relationName: "VisitorResult" }),
  notificationOverTakesAsVisited: many(NotificationOverTakes, { relationName: "VisitedResult" }),
}));

export const ImeResultsRelations = relations(ImeResults, ({ one }) => ({
  user: one(Users, { fields: [ImeResults.userId], references: [Users.id] }),
  map: one(Maps, { fields: [ImeResults.mapId], references: [Maps.id] }),
}));

export const ResultStatusesRelations = relations(ResultStatuses, ({ one }) => ({
  result: one(Results, {
    fields: [ResultStatuses.resultId],
    references: [Results.id],
  }),
}));

export const ResultClapsRelations = relations(ResultClaps, ({ one }) => ({
  user: one(Users, { fields: [ResultClaps.userId], references: [Users.id] }),
  result: one(Results, { fields: [ResultClaps.resultId], references: [Results.id] }),
}));

export const NotificationsRelations = relations(Notifications, ({ one }) => ({
  overTake: one(NotificationOverTakes, {
    fields: [Notifications.id],
    references: [NotificationOverTakes.notificationId],
  }),
}));

export const NotificationOverTakesRelations = relations(NotificationOverTakes, ({ one }) => ({
  notification: one(Notifications, {
    fields: [NotificationOverTakes.notificationId],
    references: [Notifications.id],
  }),
  visitor: one(Users, {
    fields: [NotificationOverTakes.visitorId],
    references: [Users.id],
    relationName: "visitor",
  }),
  map: one(Maps, {
    fields: [NotificationOverTakes.mapId],
    references: [Maps.id],
  }),
  visitorResult: one(Results, {
    fields: [NotificationOverTakes.visitorId, NotificationOverTakes.mapId],
    references: [Results.userId, Results.mapId],
    relationName: "VisitorResult",
  }),
  visitedResult: one(Results, {
    fields: [NotificationOverTakes.visitedId, NotificationOverTakes.mapId],
    references: [Results.userId, Results.mapId],
    relationName: "VisitedResult",
  }),
}));

export const UserProfilesRelations = relations(UserProfiles, ({ one }) => ({
  user: one(Users, { fields: [UserProfiles.userId], references: [Users.id] }),
}));

export const UserOptionsRelations = relations(UserOptions, ({ one }) => ({
  user: one(Users, { fields: [UserOptions.userId], references: [Users.id] }),
}));

export const UserTypingOptionsRelations = relations(UserTypingOptions, ({ one }) => ({
  user: one(Users, {
    fields: [UserTypingOptions.userId],
    references: [Users.id],
  }),
}));

export const UserImeTypingOptionsRelations = relations(UserImeTypingOptions, ({ one }) => ({
  user: one(Users, {
    fields: [UserImeTypingOptions.userId],
    references: [Users.id],
  }),
}));

export const UserStatsRelations = relations(UserStats, ({ one }) => ({
  user: one(Users, { fields: [UserStats.userId], references: [Users.id] }),
}));

export const UserDailyTypeCountsRelations = relations(UserDailyTypeCounts, ({ one }) => ({
  user: one(Users, {
    fields: [UserDailyTypeCounts.userId],
    references: [Users.id],
  }),
}));

export const UserMapCompletionPlayCountsRelations = relations(UserMapCompletionPlayCounts, ({ one }) => ({
  user: one(Users, {
    fields: [UserMapCompletionPlayCounts.userId],
    references: [Users.id],
  }),
  map: one(Maps, {
    fields: [UserMapCompletionPlayCounts.mapId],
    references: [Maps.id],
  }),
}));
