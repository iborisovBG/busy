import * as feedTypes from '../feed/feedActions';
import * as bookmarksActions from '../bookmarks/bookmarksActions';
import * as postsActions from './postActions';
import * as commentsActions from '../comments/commentsActions';

const postItem = (state = {}, action) => {
  switch (action.type) {
    case commentsActions.SEND_COMMENT_START:
      if (action.meta.isReplyToComment) {
        return state;
      }

      return {
        ...state,
        children: parseInt(state.children, 10) + 1,
      };
    default:
      return state;
  }
};

const initialState = {
  pendingLikes: [],
  list: {},
};

const posts = (state = initialState, action) => {
  const postsTemp = {};
  switch (action.type) {
    case feedTypes.GET_FEED_CONTENT_SUCCESS:
    case feedTypes.GET_MORE_FEED_CONTENT_SUCCESS:
    case feedTypes.GET_USER_FEED_CONTENT_SUCCESS:
    case feedTypes.GET_MORE_USER_FEED_CONTENT_SUCCESS:
    case bookmarksActions.GET_BOOKMARKS_SUCCESS:
      action.payload.postsData.forEach((post) => { postsTemp[post.id] = post; });
      return {
        ...state,
        list: {
          ...state.list,
          ...postsTemp,
        },
      };
    case postsActions.GET_CONTENT_SUCCESS:
      if (action.meta.afterLike) {
        return {
          ...state,
          pendingLikes: state.pendingLikes.filter(post => post !== action.payload.id),
          list: {
            ...state.list,
            [action.payload.id]: {
              ...state[action.payload.id],
              ...action.payload,
            },
          },
        };
      }
      return {
        ...state,
        list: {
          ...state.list,
          [action.payload.id]: {
            ...state[action.payload.id],
            ...action.payload,
          },
        },
      };
    case postsActions.LIKE_POST_START:
      return {
        ...state,
        pendingLikes: [
          ...state.pendingLikes,
          action.meta.postId,
        ],
      };
    case postsActions.LIKE_POST_ERROR:
      return {
        ...state,
        pendingLikes: state.pendingLikes.filter(post => post !== action.meta.postId),
      };
    case commentsActions.SEND_COMMENT_START:
      return {
        ...state,
        [action.meta.parentId]: postItem(state[action.meta.parentId], action),
      };
    default:
      return state;
  }
};

export default posts;

export const getPosts = state => state.list;
export const getPostContent = (state, author, permlink) =>
  Object.values(state.list)
    .find(post =>
      post.author === author &&
      post.permlink === permlink,
    );
export const getPendingLikes = state => state.pendingLikes;
