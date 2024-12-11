const PROMISE_BATCH_SIZE = 10
const ARTIST_REGEX = /- topic|official|ch.|youtube|channel\./gi
const EXPIRE_TIME = 1 // hours
const DATA_LOAD_LIMIT = 20
const QUEUE_REPEAT_TIME = 1000 * 60 * 60 * 2 // 2 hour
const MAX_VIDEO_TIME = 1000 * 60 * 10

export { PROMISE_BATCH_SIZE, ARTIST_REGEX, EXPIRE_TIME, DATA_LOAD_LIMIT, QUEUE_REPEAT_TIME, MAX_VIDEO_TIME }
