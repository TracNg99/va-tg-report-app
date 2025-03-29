// Your API slices
import { configureStore } from '@reduxjs/toolkit';

import { SearchAgentApi } from './slices/agents/search';
import { ActivityBusinessApi } from './slices/business/activity';
import { AttractionBusinessApi } from './slices/business/attraction';
import { BusinessAuthApi } from './slices/business/auth';
import { ChallengeApi } from './slices/business/challenge';
import { DestinationBusinessApi } from './slices/business/destination';
import { ExperienceBusinessApi } from './slices/business/experience';
import { LocationBusinessApi } from './slices/business/location';
import { BusinessProfileApi } from './slices/business/profile';
import { StorageApi } from './slices/storage/upload';
import { ActivityUserApi } from './slices/user/activity';
import { UserAuthApi } from './slices/user/auth';
import { JoinChallengeApi } from './slices/user/challenge';
import { ChannelApi } from './slices/user/channel';
import { DestinationApi } from './slices/user/destination';
import { ExperienceApi } from './slices/user/experience';
import { LocationUserApi } from './slices/user/location';
import { UserProfileApi } from './slices/user/profile';
import { StoryApi } from './slices/user/story';

export const store = configureStore({
  reducer: {
    [UserAuthApi.reducerPath]: UserAuthApi.reducer,
    [UserProfileApi.reducerPath]: UserProfileApi.reducer,
    [BusinessAuthApi.reducerPath]: BusinessAuthApi.reducer,
    [BusinessProfileApi.reducerPath]: BusinessProfileApi.reducer,
    [JoinChallengeApi.reducerPath]: JoinChallengeApi.reducer,
    [ChallengeApi.reducerPath]: ChallengeApi.reducer,
    [StorageApi.reducerPath]: StorageApi.reducer,
    [StoryApi.reducerPath]: StoryApi.reducer,
    [DestinationApi.reducerPath]: DestinationApi.reducer,
    [ChannelApi.reducerPath]: ChannelApi.reducer,
    [DestinationBusinessApi.reducerPath]: DestinationBusinessApi.reducer,
    [SearchAgentApi.reducerPath]: SearchAgentApi.reducer,
    [AttractionBusinessApi.reducerPath]: AttractionBusinessApi.reducer,
    [ExperienceBusinessApi.reducerPath]: ExperienceBusinessApi.reducer,
    [ExperienceApi.reducerPath]: ExperienceApi.reducer,
    [LocationBusinessApi.reducerPath]: LocationBusinessApi.reducer,
    [LocationUserApi.reducerPath]: LocationUserApi.reducer,
    [ActivityBusinessApi.reducerPath]: ActivityBusinessApi.reducer,
    [ActivityUserApi.reducerPath]: ActivityUserApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(UserAuthApi.middleware)
      .concat(UserProfileApi.middleware)
      .concat(BusinessAuthApi.middleware)
      .concat(BusinessProfileApi.middleware)
      .concat(BusinessProfileApi.middleware)
      .concat(JoinChallengeApi.middleware)
      .concat(ChallengeApi.middleware)
      .concat(StorageApi.middleware)
      .concat(StoryApi.middleware)
      .concat(DestinationApi.middleware)
      .concat(ChannelApi.middleware)
      .concat(DestinationBusinessApi.middleware)
      .concat(SearchAgentApi.middleware)
      .concat(AttractionBusinessApi.middleware)
      .concat(ExperienceBusinessApi.middleware)
      .concat(ExperienceApi.middleware)
      .concat(LocationBusinessApi.middleware)
      .concat(LocationUserApi.middleware)
      .concat(ActivityBusinessApi.middleware)
      .concat(ActivityUserApi.middleware),
});
