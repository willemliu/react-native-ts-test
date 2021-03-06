import * as TmdbActions from './TmdbActions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ADD_ITEM, SET_ITEMS, ADD_ITEMS, ADD_ITEM_NEWS, SET_ITEM_NEWS } from './TmdbActions';
import SearchMovieResult from '../components/SearchMovieResult';
import MovieDetailScreen from '../screens/MovieDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import TvDetailScreen from '../screens/TvDetailScreen';
import PersonDetailScreen from '../screens/PersonDetailScreen';
import CastAndCrewScreen from '../screens/CastAndCrewScreen';
import SearchPersonResult from '../components/SearchPersonResult';
import { navigationParamsToProps } from '../utils/navigation';
import { enhanceWithMovieSomFunctions } from '../utils/movieSom';
import SearchTvResult from '../components/SearchTvResult';
import FilmographyScreen from '../screens/FilmographyScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import PicturesScreen from '../screens/PicturesScreen';
import SearchPictureResult from '../components/SearchPictureResult';
import SettingsScreen from '../screens/SettingsScreen';
import SeasonsScreen from '../screens/SeasonsScreen';
import SearchSeasonResult from '../components/SearchSeasonResult';
import SearchEpisodeResult from '../components/SearchEpisodeResult';
import EpisodesScreen from '../screens/EpisodesScreen';
import SeasonDetailScreen from '../screens/SeasonDetailScreen';
import EpisodeDetailScreen from '../screens/EpisodeDetailScreen';
import {mapNewsStateToProps} from "./news/NewsReducer";
import AllNewsScreen from '../screens/AllNewsScreen';
import SearchNewsResult from '../components/SearchNewsResult';
import NewsScreen from '../screens/NewsScreen';
import RecommendScreen from '../screens/RecommendScreen';
import { anonymizeItems } from './rootReducer';
import CollectionScreen from '../screens/CollectionScreen';
import { mapMovieStateToProps, mapAllDispatchToProps, mapTvStateToProps, mapEpisodeStateToProps, mapPersonStateToProps, mapAllStateToProps, mapAllSearchStateToProps, mapAllSearchDispatchToProps, mapAllCollectionStateToProps, mapAllCollectionDispatchToProps, mapAllNewsStateToProps, mapAllNewsDispatchToProps, mapAllLoginStateToProps, mapAllLoginDispatchToProps } from './mapStateToProps';
import CollectionFilterScreen from "../screens/CollectionFilterScreen";
import ProfileScreen from '../screens/ProfileScreen';
import { mapLoginDispatchToProps, mapLoginStateToProps } from './login/LoginReducer';
import MovieBuddiesScreen from '../screens/MovieBuddies';

const defaultState = {
    tmdbItems: []
};

const insertOrMergeItem = (newState: any, item: any) => {
    const itemState = newState.tmdbItems.find((value: any, index: number, arr: any[]) => {
        const sameItem = (value.id === item.id
            && item.media_type
            && value.media_type === item.media_type);
        // Merge the new item with the old and return it.
        if (sameItem) {
            // console.log('MERGE', item.media_type, item.id);
            arr[index] = {...value, ...item};
        }
        return sameItem;
    });
    if (!itemState) {
        // console.log('INSERT', item.media_type, item.id);
        newState.tmdbItems.push(item);
    }
    return newState;
};

const insertOrMergeItemNews = (newState: any, action: any) => {
    const {item, newsItems} = action;
    const existingItem = newState.tmdbItems.find((value: any, index: number, arr: any[]) => (
        value.id === item.id && item.media_type && value.media_type === item.media_type)
    );
    const tempArr: any[] = [];
    if (existingItem) {
        if (!existingItem.newsItems) {
            existingItem.newsItems = [];
        }
        // Merge
        existingItem.newsItems.forEach((val: any, idx: number, arr: any[]) => {
            const existingNewsItem = newsItems.find((newsItem: any) => val.id === newsItem.id);
            if (existingNewsItem) {
                arr[idx] = {...val, ...existingNewsItem};
            }
        });
        // Insert
        newsItems.forEach((val: any, idx: number, arr: any[]) => {
            const existingNewsItem = existingItem.newsItems.find((newsItem: any) => val.id === newsItem.id);
            if (!existingNewsItem) {
                tempArr.push(val);
            }
        });
        if (tempArr.length > 0) {
            existingItem.newsItems = existingItem.newsItems.concat(tempArr);
        }
    }
    return newState;
};

export function tmdbReducer(state: any = defaultState, action: any) {
    let newState = {...state};
    switch (action.type) {
        case ADD_ITEM:
            return insertOrMergeItem(newState, action.item);
        case ADD_ITEMS:
            action.items.forEach((item: any) => {
                newState = insertOrMergeItem(newState, item);
            });
            return newState;
        case SET_ITEMS:
            newState.tmdbItems = action.items;
            return newState;
        case ADD_ITEM_NEWS:
            return insertOrMergeItemNews(newState, action);
        case SET_ITEM_NEWS:
            const existingItem = newState.tmdbItems.find((val: any) => (
                action.item.id === val.id && action.item.media_type === val.media_type
            ));
            if (existingItem) {
                existingItem.newsItems = action.newsItems;
            }
            return newState;
        case "LOGOUT":
            return {tmdbItems: anonymizeItems(newState.tmdbItems)};
        default:
            return newState;
    }
}

export function mapTmdbStateToProps(state: any, ownProps: any) {
    return {
        ...(state.tmdb.tmdbItems.find((value: any) => {
            const result = (value.id === ownProps.id && value.media_type === ownProps.media_type)
            || (ownProps.navigation
                && value.id === ownProps.navigation.getParam('id')
                && value.media_type === ownProps.navigation.getParam('media_type'));
            return result;
        }))
    };
}
export function mapTmdbMovieStateToProps(state: any, ownProps: any) {
    return {
        ...(state.tmdb.tmdbItems.find((value: any) => {
            const result = (value.id === ownProps.id && value.media_type === 'movie')
            || (ownProps.navigation
                && value.id === ownProps.navigation.getParam('id')
                && ownProps.navigation.getParam('media_type') === 'movie');
            return result;
        })),
    };
}
export function mapTmdbPersonStateToProps(state: any, ownProps: any) {
    return {
        ...(state.tmdb.tmdbItems.find((value: any) => {
            const result = (value.id === ownProps.id && value.media_type === 'person')
            || (ownProps.navigation
                && value.id === ownProps.navigation.getParam('id')
                && ownProps.navigation.getParam('media_type') === 'person');
            return result;
        })),
    };
}
export function mapTmdbTvStateToProps(state: any, ownProps: any) {
    return {
        ...(state.tmdb.tmdbItems.find((value: any) => {
            const result = (value.id === ownProps.id && value.media_type === 'tv')
            || (ownProps.navigation
                && value.id === ownProps.navigation.getParam('id')
                && ownProps.navigation.getParam('media_type') === 'tv');
            return result;
        })),
    };
}
export function mapTmdbEpisodeStateToProps(state: any, ownProps: any) {
    return {
        ...(state.tmdb.tmdbItems.find((value: any) => {
            const result = (value.id === ownProps.id && value.media_type === 'episode')
            || (ownProps.navigation
                && value.id === ownProps.navigation.getParam('id')
                && ownProps.navigation.getParam('media_type') === 'episode');
            return result;
        })),
    };
}

function withItemsToProps(Function: any) {
    return (state: any, ownProps: any) => {
        return {...(Function(state, ownProps)), tmdbItems: state.tmdb.tmdbItems};
    };
}

export function mapTmdbDispatchToProps(dispatch: any, ownProps: any) {
    return {
        actions: bindActionCreators(TmdbActions as any, dispatch)
    };
}

const searchMovieResult = connect(mapMovieStateToProps, mapAllDispatchToProps)(enhanceWithMovieSomFunctions(SearchMovieResult));
export {searchMovieResult as SearchMovieResult};

const searchTvResult = connect(mapTvStateToProps, mapAllDispatchToProps)(enhanceWithMovieSomFunctions(SearchTvResult));
export {searchTvResult as SearchTvResult};

const searchSeasonResult = enhanceWithMovieSomFunctions(SearchSeasonResult);
export {searchSeasonResult as SearchSeasonResult};

const searchEpisodeResult = connect(mapEpisodeStateToProps, mapAllDispatchToProps)(enhanceWithMovieSomFunctions(SearchEpisodeResult));
export {searchEpisodeResult as SearchEpisodeResult};

const searchPersonResult = connect(mapPersonStateToProps, mapAllDispatchToProps)(enhanceWithMovieSomFunctions(SearchPersonResult));
export {searchPersonResult as SearchPersonResult};

const searchPictureResult = connect(mapPersonStateToProps, mapAllDispatchToProps)(enhanceWithMovieSomFunctions(SearchPictureResult));
export {searchPictureResult as SearchPictureResult};

const searchNewsResult = connect(mapNewsStateToProps, mapAllDispatchToProps)(enhanceWithMovieSomFunctions(SearchNewsResult));
export {searchNewsResult as SearchNewsResult};

const movieDetailScreen = navigationParamsToProps(connect(mapMovieStateToProps, mapAllDispatchToProps)(enhanceWithMovieSomFunctions(MovieDetailScreen)));
export {movieDetailScreen as MovieDetailScreen};

const tvDetailScreen = navigationParamsToProps(connect(mapTvStateToProps, mapAllDispatchToProps)(enhanceWithMovieSomFunctions(TvDetailScreen)));
export {tvDetailScreen as TvDetailScreen};

const seasonDetailScreen = navigationParamsToProps(connect(mapTvStateToProps, mapAllDispatchToProps)(enhanceWithMovieSomFunctions(SeasonDetailScreen)));
export {seasonDetailScreen as SeasonDetailScreen};

const episodeDetailScreen = navigationParamsToProps(connect(mapEpisodeStateToProps, mapAllDispatchToProps)(enhanceWithMovieSomFunctions(EpisodeDetailScreen)));
export {episodeDetailScreen as EpisodeDetailScreen};

const personDetailScreen = navigationParamsToProps(connect(mapPersonStateToProps, mapAllDispatchToProps)(enhanceWithMovieSomFunctions(PersonDetailScreen)));
export {personDetailScreen as PersonDetailScreen};

const castAndCrewScreen = navigationParamsToProps(connect(mapAllStateToProps, mapAllDispatchToProps)(CastAndCrewScreen));
export {castAndCrewScreen as CastAndCrewScreen};

const newsScreen = navigationParamsToProps(connect(mapAllStateToProps, mapAllDispatchToProps)(enhanceWithMovieSomFunctions(NewsScreen)));
export {newsScreen as NewsScreen};

const seasonsScreen = navigationParamsToProps(connect(mapAllStateToProps, mapAllDispatchToProps)(enhanceWithMovieSomFunctions(SeasonsScreen)));
export {seasonsScreen as SeasonsScreen};

const episodesScreen = navigationParamsToProps(connect(mapAllStateToProps, mapAllDispatchToProps)(EpisodesScreen));
export {episodesScreen as EpisodesScreen};

const filmographyScreen = navigationParamsToProps(connect(mapAllStateToProps, mapAllDispatchToProps)(FilmographyScreen));
export {filmographyScreen as FilmographyScreen};

const picturesScreen = navigationParamsToProps(connect(mapAllStateToProps, mapAllDispatchToProps)(PicturesScreen));
export {picturesScreen as PicturesScreen};

/**
 * SEARCH
 */

const searchScreen = connect(mapAllSearchStateToProps, mapAllSearchDispatchToProps)(enhanceWithMovieSomFunctions(SearchScreen));
export {searchScreen as SearchScreen};

/**
 * COLLECTION
 */

const collectionScreen = connect(mapAllCollectionStateToProps, mapAllCollectionDispatchToProps)(navigationParamsToProps(enhanceWithMovieSomFunctions(CollectionScreen)));
export {collectionScreen as CollectionScreen};

const collectionFilterScreen = connect(mapAllCollectionStateToProps, mapAllCollectionDispatchToProps)(navigationParamsToProps(enhanceWithMovieSomFunctions(CollectionFilterScreen)));
export {collectionFilterScreen as CollectionFilterScreen};

/**
 * NEWS
 */

const allNewsScreen = connect(mapAllNewsStateToProps, mapAllNewsDispatchToProps)(enhanceWithMovieSomFunctions(AllNewsScreen));
export {allNewsScreen as AllNewsScreen};

/**
 * RECOMMEND
 */

const recommendScreen = navigationParamsToProps(connect(mapAllLoginStateToProps, mapAllLoginDispatchToProps)(enhanceWithMovieSomFunctions(RecommendScreen)));
export {recommendScreen as RecommendScreen};

/**
 * PROFILE
 */

const profileScreen = connect(mapLoginStateToProps, mapLoginDispatchToProps)(enhanceWithMovieSomFunctions(ProfileScreen));
export {profileScreen as ProfileScreen};

/**
 * MOVIE BUDDIES
 */

const movieBuddiesScreen = connect(mapLoginStateToProps, mapLoginDispatchToProps)(enhanceWithMovieSomFunctions(MovieBuddiesScreen));
export {movieBuddiesScreen as MovieBuddiesScreen};

/**
 * SETTINGS
 */

const settingsScreen = connect(mapAllStateToProps, mapAllDispatchToProps)(SettingsScreen);
export {settingsScreen as SettingsScreen};

/**
 * LOGIN
 */

const loginScreen = navigationParamsToProps(connect(mapAllLoginStateToProps, mapAllLoginDispatchToProps)(LoginScreen));
export {loginScreen as LoginScreen};

const signUpScreen = connect(mapAllLoginStateToProps, mapAllLoginDispatchToProps)(SignUpScreen);
export {signUpScreen as SignUpScreen};
