import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  accounts: {
    user: r.one.users({
      from: r.accounts.userId,
      to: r.users.id,
    }),
  },
  users: {
    accounts: r.many.accounts(),
    mapsViaImeResults: r.many.maps({
      alias: "maps_id_users_id_via_imeResults",
    }),
    mapBookmarkLists: r.many.mapBookmarkLists(),
    mapsViaMapLikes: r.many.maps({
      alias: "maps_id_users_id_via_mapLikes",
    }),
    mapsCreatorId: r.many.maps({
      alias: "maps_creatorId_users_id",
    }),
    notificationClaps: r.many.notificationClaps({
      from: r.users.id,
      to: r.notificationClaps.clapperId,
    }),
    notificationLikes: r.many.notificationLikes({
      from: r.users.id,
      to: r.notificationLikes.likerId,
    }),
    notificationMapBookmarks: r.many.notificationMapBookmarks({
      from: r.users.id,
      to: r.notificationMapBookmarks.bookmarkerId,
    }),
    notificationOverTakes: r.many.notificationOverTakes({
      from: r.users.id,
      to: r.notificationOverTakes.visitorId,
    }),
    notifications: r.many.notifications(),
    results: r.many.results(),
    mapsViaResults: r.many.maps({
      alias: "maps_id_users_id_via_results",
    }),
    sessions: r.many.sessions(),
    userDailyTypeCounts: r.many.userDailyTypeCounts(),
    userImeTypingOptions: r.many.userImeTypingOptions(),
    userMapCompletionPlayCounts: r.many.userMapCompletionPlayCounts(),
    userOptions: r.many.userOptions(),
    userProfiles: r.many.userProfiles(),
    userStats: r.many.userStats(),
    userTypingOptions: r.many.userTypingOptions(),
    userReportsAsReporter: r.many.userReports({
      from: r.users.id,
      to: r.userReports.reporterId,
      alias: "user_reports_reporter_id_users_id",
    }),
    userReportsAsReported: r.many.userReports({
      from: r.users.id,
      to: r.userReports.reportedUserId,
      alias: "user_reports_reported_user_id_users_id",
    }),
  },
  maps: {
    creator: r.one.users({
      from: r.maps.creatorId,
      to: r.users.id,
      optional: false,
    }),
    difficulty: r.one.mapDifficulties({
      from: r.maps.id,
      to: r.mapDifficulties.mapId,
      optional: false,
    }),
    mapTags: r.many.mapTags({
      from: r.maps.id,
      to: r.mapTags.mapId,
    }),
    mapLikes: r.many.mapLikes({
      from: r.maps.id,
      to: r.mapLikes.mapId,
    }),
    results: r.many.results({
      from: r.maps.id,
      to: r.results.mapId,
    }),
    usersViaImeResults: r.many.users({
      from: r.maps.id.through(r.imeResults.mapId),
      to: r.users.id.through(r.imeResults.userId),
      alias: "maps_id_users_id_via_imeResults",
    }),
    mapBookmarkLists: r.many.mapBookmarkLists(),
    mapDifficulties: r.many.mapDifficulties(),
    usersViaMapLikes: r.many.users({
      from: r.maps.id.through(r.mapLikes.mapId),
      to: r.users.id.through(r.mapLikes.userId),
      alias: "maps_id_users_id_via_mapLikes",
    }),
    user: r.one.users({
      from: r.maps.creatorId,
      to: r.users.id,
      alias: "maps_creatorId_users_id",
    }),
    notificationLikes: r.many.notificationLikes({
      from: r.maps.id,
      to: r.notificationLikes.mapId,
    }),
    notificationMapBookmarks: r.many.notificationMapBookmarks({
      from: r.maps.id,
      to: r.notificationMapBookmarks.mapId,
    }),
    notificationOverTakes: r.many.notificationOverTakes({
      from: r.maps.id,
      to: r.notificationOverTakes.mapId,
    }),
    usersViaResults: r.many.users({
      from: r.maps.id.through(r.results.mapId),
      to: r.users.id.through(r.results.userId),
      alias: "maps_id_users_id_via_results",
    }),
  },
  tags: {
    mapTags: r.many.mapTags({
      from: r.tags.id,
      to: r.mapTags.tagId,
    }),
  },
  mapTags: {
    map: r.one.maps({
      from: r.mapTags.mapId,
      to: r.maps.id,
      optional: false,
    }),
    tag: r.one.tags({
      from: r.mapTags.tagId,
      to: r.tags.id,
      optional: false,
    }),
  },
  mapBookmarkLists: {
    maps: r.many.maps({
      from: r.mapBookmarkLists.id.through(r.mapBookmarkListItems.listId),
      to: r.maps.id.through(r.mapBookmarkListItems.mapId),
    }),
    user: r.one.users({
      from: r.mapBookmarkLists.userId,
      to: r.users.id,
    }),
    notificationMapBookmarks: r.many.notificationMapBookmarks({
      from: r.mapBookmarkLists.id,
      to: r.notificationMapBookmarks.listId,
    }),
  },
  mapDifficulties: {
    map: r.one.maps({
      from: r.mapDifficulties.mapId,
      to: r.maps.id,
      optional: false,
    }),
  },
  notificationClaps: {
    clapper: r.one.users({
      from: r.notificationClaps.clapperId,
      to: r.users.id,
      optional: false,
    }),
    user: r.one.users({
      from: r.notificationClaps.clapperId,
      to: r.users.id,
      optional: false,
    }),
    notification: r.one.notifications({
      from: r.notificationClaps.notificationId,
      to: r.notifications.id,
      optional: false,
    }),
    result: r.one.results({
      from: r.notificationClaps.resultId,
      to: r.results.id,
      optional: false,
    }),
  },
  notifications: {
    mapBookmark: r.one.notificationMapBookmarks({
      from: r.notifications.id,
      to: r.notificationMapBookmarks.notificationId,
    }),
    overTake: r.one.notificationOverTakes({
      from: r.notifications.id,
      to: r.notificationOverTakes.notificationId,
    }),
    like: r.one.notificationLikes({
      from: r.notifications.id,
      to: r.notificationLikes.notificationId,
    }),
    clap: r.one.notificationClaps({
      from: r.notifications.id,
      to: r.notificationClaps.notificationId,
    }),
    reportResult: r.one.notificationReportResults({
      from: r.notifications.id,
      to: r.notificationReportResults.notificationId,
    }),
    warning: r.one.notificationWarnings({
      from: r.notifications.id,
      to: r.notificationWarnings.notificationId,
    }),
    notificationClaps: r.many.notificationClaps({
      from: r.notifications.id,
      to: r.notificationClaps.notificationId,
    }),
    notificationLikes: r.many.notificationLikes({
      from: r.notifications.id,
      to: r.notificationLikes.notificationId,
    }),
    notificationMapBookmarks: r.many.notificationMapBookmarks({
      from: r.notifications.id,
      to: r.notificationMapBookmarks.notificationId,
    }),
    notificationOverTakes: r.many.notificationOverTakes({
      from: r.notifications.id,
      to: r.notificationOverTakes.notificationId,
    }),
    notificationReportResults: r.many.notificationReportResults({
      from: r.notifications.id,
      to: r.notificationReportResults.notificationId,
    }),
    notificationWarnings: r.many.notificationWarnings({
      from: r.notifications.id,
      to: r.notificationWarnings.notificationId,
    }),
    user: r.one.users({
      from: r.notifications.recipientId,
      to: r.users.id,
      optional: false,
    }),
  },
  results: {
    map: r.one.maps({
      from: r.results.mapId,
      to: r.maps.id,
      optional: false,
    }),
    status: r.one.resultStatuses({
      from: r.results.id,
      to: r.resultStatuses.resultId,
      optional: false,
    }),
    notificationClaps: r.many.notificationClaps(),
    users: r.many.users({
      from: r.results.id.through(r.resultClaps.resultId),
      to: r.users.id.through(r.resultClaps.userId),
    }),
    resultStatuses: r.many.resultStatuses(),
  },
  notificationLikes: {
    liker: r.one.users({
      from: r.notificationLikes.likerId,
      to: r.users.id,
      optional: false,
    }),
    user: r.one.users({
      from: r.notificationLikes.likerId,
      to: r.users.id,
      optional: false,
    }),
    map: r.one.maps({
      from: r.notificationLikes.mapId,
      to: r.maps.id,
      optional: false,
    }),
    notification: r.one.notifications({
      from: r.notificationLikes.notificationId,
      to: r.notifications.id,
      optional: false,
    }),
  },
  notificationMapBookmarks: {
    bookmarker: r.one.users({
      from: r.notificationMapBookmarks.bookmarkerId,
      to: r.users.id,
      optional: false,
    }),
    list: r.one.mapBookmarkLists({
      from: r.notificationMapBookmarks.listId,
      to: r.mapBookmarkLists.id,
      optional: false,
    }),
    user: r.one.users({
      from: r.notificationMapBookmarks.bookmarkerId,
      to: r.users.id,
      optional: false,
    }),
    mapBookmarkList: r.one.mapBookmarkLists({
      from: r.notificationMapBookmarks.listId,
      to: r.mapBookmarkLists.id,
      optional: false,
    }),
    map: r.one.maps({
      from: r.notificationMapBookmarks.mapId,
      to: r.maps.id,
      optional: false,
    }),
    notification: r.one.notifications({
      from: r.notificationMapBookmarks.notificationId,
      to: r.notifications.id,
      optional: false,
    }),
  },
  notificationOverTakes: {
    visitor: r.one.users({
      from: r.notificationOverTakes.visitorId,
      to: r.users.id,
      optional: false,
    }),
    visitedResult: r.one.results({
      from: [r.notificationOverTakes.visitedId, r.notificationOverTakes.mapId],
      to: [r.results.userId, r.results.mapId],
      alias: "notification_over_takes_visited_result",
      optional: false,
    }),
    visitorResult: r.one.results({
      from: [r.notificationOverTakes.visitorId, r.notificationOverTakes.mapId],
      to: [r.results.userId, r.results.mapId],
      alias: "notification_over_takes_visitor_result",
      optional: false,
    }),
    map: r.one.maps({
      from: r.notificationOverTakes.mapId,
      to: r.maps.id,
      optional: false,
    }),
    notification: r.one.notifications({
      from: r.notificationOverTakes.notificationId,
      to: r.notifications.id,
      optional: false,
    }),
    user: r.one.users({
      from: r.notificationOverTakes.visitorId,
      to: r.users.id,
      optional: false,
    }),
  },
  notificationReportResults: {
    notification: r.one.notifications({
      from: r.notificationReportResults.notificationId,
      to: r.notifications.id,
      optional: false,
    }),
    report: r.one.userReports({
      from: r.notificationReportResults.reportId,
      to: r.userReports.id,
      optional: false,
    }),
  },
  notificationWarnings: {
    notification: r.one.notifications({
      from: r.notificationWarnings.notificationId,
      to: r.notifications.id,
      optional: false,
    }),
    report: r.one.userReports({
      from: r.notificationWarnings.reportId,
      to: r.userReports.id,
      optional: false,
    }),
  },
  resultStatuses: {
    result: r.one.results({
      from: r.resultStatuses.resultId,
      to: r.results.id,
      optional: false,
    }),
  },
  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
    }),
  },
  userDailyTypeCounts: {
    user: r.one.users({
      from: r.userDailyTypeCounts.userId,
      to: r.users.id,
    }),
  },
  userImeTypingOptions: {
    user: r.one.users({
      from: r.userImeTypingOptions.userId,
      to: r.users.id,
    }),
  },
  userMapCompletionPlayCounts: {
    user: r.one.users({
      from: r.userMapCompletionPlayCounts.userId,
      to: r.users.id,
    }),
  },
  userOptions: {
    user: r.one.users({
      from: r.userOptions.userId,
      to: r.users.id,
    }),
  },
  userProfiles: {
    user: r.one.users({
      from: r.userProfiles.userId,
      to: r.users.id,
    }),
  },
  userReports: {
    reporter: r.one.users({
      from: r.userReports.reporterId,
      to: r.users.id,
      alias: "user_reports_reporter_id_users_id",
      optional: false,
    }),
    reportedUser: r.one.users({
      from: r.userReports.reportedUserId,
      to: r.users.id,
      alias: "user_reports_reported_user_id_users_id",
      optional: false,
    }),
    resolver: r.one.users({
      from: r.userReports.resolvedBy,
      to: r.users.id,
      alias: "user_reports_resolved_by_users_id",
    }),
    notificationReportResult: r.one.notificationReportResults({
      from: r.userReports.id,
      to: r.notificationReportResults.reportId,
    }),
    notificationWarning: r.one.notificationWarnings({
      from: r.userReports.id,
      to: r.notificationWarnings.reportId,
    }),
  },
  userStats: {
    user: r.one.users({
      from: r.userStats.userId,
      to: r.users.id,
    }),
  },
  userTypingOptions: {
    user: r.one.users({
      from: r.userTypingOptions.userId,
      to: r.users.id,
    }),
  },
}));
