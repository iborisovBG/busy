import React from 'react';
import PropTypes from 'prop-types';
import embedjs from 'embedjs';
import _ from 'lodash';
import PostFeedEmbed from './PostFeedEmbed';
import BodyShort from './BodyShort';
import { jsonParse } from '../../helpers/formatter';
import { image } from '../../vendor/steemitLinks';
import {
  getPositions,
  isPostStartsWithAPicture,
  isPostStartsWithAnEmbed,
  isPostWithPictureBeforeFirstHalf,
  isPostWithEmbedBeforeFirstHalf,
} from './StoryHelper';
import { getHtml } from './Body';

const IMG_PROXY_PREFIX = '//res.cloudinary.com/hpiynhbhq/image/fetch/w_600,h_800,c_limit/';

const StoryPreview = ({ post }) => {
  const jsonMetadata = jsonParse(post.json_metadata);
  let imagePath = '';

  if (jsonMetadata.image && jsonMetadata.image[0]) {
    imagePath = `${IMG_PROXY_PREFIX}${jsonMetadata.image[0]}`;
  } else {
    const bodyImg = post.body.match(image());
    if (bodyImg && bodyImg.length) {
      imagePath = `${IMG_PROXY_PREFIX}${bodyImg[0]}`;
    }
  }

  const embeds = embedjs.getAll(post.body);
  const video = jsonMetadata.video;
  let hasVideo = false;
  if (_.has(video, 'content.videohash') && _.has(video, 'info.snaphash')) {
    hasVideo = true;
    embeds[0] = {
      type: 'video',
      provider_name: 'DTube',
      embed: `<video controls="true" autoplay="true" src="https://ipfs.io/ipfs/${video.content.videohash}" poster="https://ipfs.io/ipfs/${video.info.snaphash}"><track kind="captions" /></video>`,
      thumbnail: `${IMG_PROXY_PREFIX}https://ipfs.io/ipfs/${video.info.snaphash}`,
    };
  }

  const preview = {
    text: () => <BodyShort key="text" className="Story__content__body" body={post.body} />,

    embed: () => embeds && embeds[0] && <PostFeedEmbed key="embed" embed={embeds[0]} />,

    image: () =>
      (<div key={imagePath} className="Story__content__img-container">
        <img alt="post" src={imagePath} />
      </div>),
  };

  const htmlBody = getHtml(post.body, {}, 'text');
  const tagPositions = getPositions(htmlBody);
  const bodyData = [];

  if (hasVideo) {
    bodyData.push(preview.embed());
    bodyData.push(preview.text());
  } else if (isPostStartsWithAPicture(tagPositions)) {
    bodyData.push(preview.image());
    bodyData.push(preview.text());
  } else if (isPostStartsWithAnEmbed(tagPositions)) {
    bodyData.push(preview.embed());
    bodyData.push(preview.text());
  } else if (isPostWithPictureBeforeFirstHalf(tagPositions)) {
    bodyData.push(preview.text());
    bodyData.push(preview.image());
  } else if (isPostWithEmbedBeforeFirstHalf(tagPositions)) {
    bodyData.push(preview.text());
    bodyData.push(preview.embed());
  } else {
    bodyData.push(preview.text());
  }

  return (
    <div>
      {bodyData}
    </div>
  );
};

StoryPreview.propTypes = {
  post: PropTypes.shape().isRequired,
};

export default StoryPreview;
