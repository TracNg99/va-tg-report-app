'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  InputWrapper,
  Progress,
  Select,
  Textarea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import StoryLoadingIcon from '@/assets/story-loading-icon';
import VoiceToTextButton from '@/components/audio-handler/voice-to-text';
import ImageUploader from '@/components/image-uploader/image-picker';
import Section from '@/components/layouts/section';
import { useUploadImageMutation } from '@/store/redux/slices/storage/upload';
import { useGetActivitiesInExperienceQuery } from '@/store/redux/slices/user/activity';
import { useGetAllChannelsQuery } from '@/store/redux/slices/user/channel';
import { useGetAllExperiencesQuery } from '@/store/redux/slices/user/experience';
import {
  useGenerateStoryMutation,
  useUploadStoryMutation,
} from '@/store/redux/slices/user/story';

const RandomLoading = ({ progress = 0 }: { progress: number }) => {
  // const [progress, setProgress] = useState(0);

  // useEffect(() => {
  //   let timeout: NodeJS.Timeout | null = null;

  //   // Increase progress at random interval between 0.5s and 1.5s with a max at 95%
  //   const increaseProgress = () => {
  //     const randomInterval = Math.floor(Math.random() * 1000) + 500;
  //     timeout = setTimeout(() => {
  //       setProgress((prev) => {
  //         if (prev >= 95) {
  //           clearTimeout(timeout!);
  //           timeout = null;
  //           return 95;
  //         }
  //         return Math.min(95, prev + Math.floor(Math.random() * 10) + 5);
  //       });
  //       increaseProgress();
  //     }, randomInterval);
  //   };

  //   increaseProgress();

  //   return () => {
  //     if (timeout) {
  //       clearTimeout(timeout);
  //     }
  //   };
  // }, []);

  return (
    <Section className="flex flex-col items-center sm:max-w-5xl mx-auto px-4 pt-20">
      <StoryLoadingIcon />
      <p className="text-base-black font-semibold text-display-md mt-20">
        Generating your beautiful travel story...
      </p>
      <Progress className="mt-12 h-4 w-full" value={progress} />
    </Section>
  );
};

const storySchema = z.object({
  experienceId: z.string().nonempty('Select an experience'),
  channelId: z.string().nonempty('Select a channel'),
  notes: z.string().nonempty("Story can't be empty"),
  media: z.array(z.string()).min(1, 'Must upload at least 1 photo'),
});

type StorySchema = z.infer<typeof storySchema>;

const NewStoryPage = () => {
  const router = useRouter();
  const [experienceId, setExperienceId] = useState<string>('');
  const [experiences, setExperiences] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [activitiesNames, setActivitiesNames] = useState<string[]>(['']);
  const [isConfirmClicked, setIsConfirmClicked] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [texts, setTexts] = useState<string>('');

  const [generateStory] = useGenerateStoryMutation();
  const [uploadStory] = useUploadStoryMutation();
  const [uploadImage] = useUploadImageMutation();

  const form = useForm<StorySchema>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      channelId: 'No experience selected',
      experienceId: 'No channel selected',
      media: [],
      notes: '',
    },
    mode: 'onTouched',
  });

  const { data: experiencesData } = useGetAllExperiencesQuery();

  const { data: channelsData } = useGetAllChannelsQuery();

  const { data: activitiesData, refetch } = useGetActivitiesInExperienceQuery(
    {
      experience_id: experienceId,
    },
    {
      skip: !experienceId,
    },
  );

  useEffect(() => {
    if (activitiesData) {
      setActivitiesNames(activitiesData.map((item) => item.title));
    }
  }, [activitiesData]);

  useEffect(() => {
    if (experiencesData) {
      const mappedExperiencesInfo = experiencesData.map((item) => item.name);
      setExperiences(mappedExperiencesInfo);
    }
  }, [experiencesData]);

  useEffect(() => {
    if (channelsData) {
      const mappedChannelsInfo = channelsData.data!.map((item) => item.name!);
      setChannels(mappedChannelsInfo);
    }
  }, [channelsData]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (
        name === 'experienceId' &&
        typeof value?.experienceId === 'string' &&
        experiencesData
      ) {
        setExperienceId(
          experiencesData!.find((e) => e.name === value?.experienceId)!.id,
        );
        refetch();
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch('experienceId'), experiencesData]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      setTexts(value?.notes ?? '');
    });

    return () => subscription.unsubscribe();
  }, [texts, form.watch('notes')]);

  const handleInputsUpload = async (userInputs: StorySchema) => {
    if (userInputs.experienceId === 'No experience selected') {
      notifications.show({
        title: 'Warning: No experience was selected',
        message: 'Please choose an experience for your story!',
        color: 'yellow',
      });
      return;
    }

    if (userInputs.experienceId === 'No channel selected') {
      notifications.show({
        title: 'Warning: No channel was selected',
        message: 'Please choose an channel for your story!',
        color: 'yellow',
      });
      return;
    }
    setIsConfirmClicked(true);

    const matchedExperience = experiencesData!.find(
      (item) => item.name === userInputs.experienceId,
    );

    const results = Promise.all(
      userInputs.media.map(async (img: string | null, index: number) => {
        // getPayLoadSize([img]);
        const result = await uploadImage({
          imageBase64: img,
          title: `ind-${index}`,
          bucket: 'challenge',
        });

        if (result.error) {
          return false;
        }

        if (result.data) {
          setProgress((prev) =>
            Math.min(30, prev + Math.floor(30 / userInputs.media.length)),
          );
          return result.data?.signedUrl;
        }
      }),
    );

    const storageUrls = await results;

    const matchedChannel = channelsData?.data?.find(
      (e) => e.name === userInputs.channelId,
    );

    const { data: generatedStory, error: generateError } = await generateStory({
      payload: {
        experienceName: userInputs.experienceId,
        activities: activitiesNames,
        notes: userInputs.notes as string,
        media: storageUrls as string[],
        brandVoice: matchedChannel?.['brand_voice'],
        channelType: matchedChannel?.['channel_type'],
      },
    });

    setProgress(70);

    if (generateError) {
      setIsConfirmClicked(false);
      notifications.show({
        title: 'Error: Story generation failure',
        message: 'Fail to generate new story! Please try again!',
        color: 'red',
      });
      return;
    }

    if (generatedStory && generatedStory?.data) {
      const { story_content, ...rest } = generatedStory.data;
      const finalStory = story_content.replace(/\*/g, '');
      const { data: submissionResult, error: submissionError } =
        await uploadStory({
          payload: {
            experience_id: matchedExperience!.id,
            channel_id: matchedChannel!.id,
            notes: userInputs.notes as string,
            story_content: finalStory,
            media: storageUrls,
            ...rest,
          },
        });

      if (submissionResult && submissionResult?.data) {
        setProgress(95);
        router.push(`/stories/${submissionResult.data.id}/`);
        sessionStorage.removeItem('notes');
        sessionStorage.removeItem('experienceId');
        sessionStorage.removeItem('channelId');
        setIsConfirmClicked(false);
      } else {
        setIsConfirmClicked(false);
        notifications.show({
          title: 'Error: Story generation failure',
          message: (submissionError as string) ?? 'Fail to upload story!',
          color: 'red',
        });
      }
    }
  };

  const handleTranscription = (transcript: string) => {
    form.setValue('notes', transcript);
  };

  if (form.formState.isSubmitting) {
    return <RandomLoading progress={progress} />;
  }

  return (
    <form
      className="pt-15 lg:pt-32"
      onSubmit={form.handleSubmit(handleInputsUpload)}
    >
      <Section className="grid lg:grid-cols-[300px_1fr] gap-x-8 gap-y-4 lg:gap-y-16 max-w-5xl mx-auto px-4">
        <label
          htmlFor="experienceId"
          className="text-md font-medium text-base-black"
        >
          Select Destination
        </label>
        <Controller
          control={form.control}
          name="experienceId"
          render={({ field: { onChange, value } }) => (
            <Select
              allowDeselect={false}
              className="mb-4 lg:mb-0"
              id="experienceId"
              placeholder="Select an experience for your story"
              classNames={{
                input: 'h-14',
              }}
              error={form.formState.errors.experienceId?.message}
              data={experiences} // .map((item)=>item.label)
              onChange={onChange}
              value={value as any}
            />
          )}
        />
        <label
          htmlFor="channelId"
          className="text-md font-medium text-base-black"
        >
          Select channel
        </label>
        <Controller
          control={form.control}
          name="channelId"
          render={({ field: { onChange, value } }) => (
            <Select
              allowDeselect={false}
              className="mb-4 lg:mb-0"
              id="channelId"
              placeholder="Select a channel of brand voice you've created"
              classNames={{
                input: 'h-14',
              }}
              error={form.formState.errors.channelId?.message}
              data={channels}
              onChange={onChange}
              value={value as any}
            />
          )}
        />
        <label htmlFor="story" className="text-md font-medium text-base-black">
          Create your story
        </label>
        <div className="relative mb-4 lg:mb-0">
          <Textarea
            id="story"
            placeholder="Share us your story!"
            resize="vertical"
            classNames={{
              input: 'pb-20 pt-4',
            }}
            error={form.formState.errors.notes?.message}
            {...form.register('notes')}
          />
          <VoiceToTextButton
            language="en-US"
            existingTexts={texts}
            onUnsupportDetected={() => {
              notifications.show({
                title: 'Error: Browser not supported',
                message: 'This browser does not support speech recognition',
                color: 'red',
              });
            }}
            onTranscribe={(e) => handleTranscription(e)}
          />
        </div>
        <label htmlFor="media" className="text-md font-medium text-base-black">
          Upload your photos
        </label>
        <Controller
          control={form.control}
          name="media"
          render={({ field }) => (
            <InputWrapper error={form.formState.errors.media?.message}>
              <ImageUploader
                onImageUpload={(files) => {
                  field.onChange(files.map((item) => item.image));
                }}
                allowMultiple={true}
                withResize={true}
              />
            </InputWrapper>
          )}
        />
        <div className="lg:col-span-2 flex justify-end">
          <Button
            className="lg:w-96 h-16"
            disabled={!form.formState.isValid}
            type="submit"
            loading={isConfirmClicked}
          >
            Submit your story
          </Button>
        </div>
      </Section>
    </form>
  );
};

export default NewStoryPage;
