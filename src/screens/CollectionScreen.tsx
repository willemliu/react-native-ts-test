import React from 'react';
import {Button, Text, TextInput, View, FlatList, AsyncStorage} from 'react-native';
import {viewStyle, searchScreenStyle, transparentColor, sectionListStyle} from "../styles/Styles";
import SearchResultTemplate from '../components/SearchResultTemplate';
import { MovieSomServices } from '../moviesom/MovieSom';

export interface GetUsersMoviesList {
    token: string;
    query: string;
    filter_connection: number|'';
    all_filter: 'true'|'false';
    watched_filter: 'true'|'false';
    blu_ray_filter: 'true'|'false';
    dvd_filter: 'true'|'false';
    digital_filter: 'true'|'false';
    other_filter: 'true'|'false';
    lend_out_filter: 'true'|'false';
    note_filter: 'true'|'false';
    spoiler_filter: 'true'|'false';
    sort: 'added'|'updated'|'sort_watched'|'default'|'';
    page: number;
}

export interface GetUsersMoviesListResponse {
    getUsersMoviesList: {
        status: number,
        page: number,
        total_results: number,
        total_pages: number,
        results: GetUsersMoviesListResult[],
        execTime: number
    };
    execTime: number;
}

export interface GetUsersMoviesListResult {
    id: number;
    title: string;
    name: string;
    runtime: number;
    number_of_episodes: number;
    number_of_seasons: number;
    first_air_date: string;
    release_date: string;
    last_air_date: string;
    backdrop_path: string;
    poster_path: string;
    episode_title: string;
    season_number: number;
    episode_number: number;
    air_date: string;
    tmdb_id: number;
    rating: number;
    votes: number;
    updated: string;
    imdb_id: string;
    watched: number;
    want_to_watch: number;
    blu_ray: number;
    dvd: number;
    digital: number;
    other: number;
    lend_out: number;
    recommend: number;
    added: string;
    user_updated: string;
    recommend_date: string;
    spoiler: string;
    media_type: 'movie'|'tv'|'episode';
    adult: any;
    original_title: string;
    popularity: any;
    video: boolean;
    vote_average: number;
    vote_count: number;
    owned: number;
}

export interface Props {
    page: number;
    totalPages: number;
    loginToken: string;
    loggedIn: boolean;
    navigation: any;
    actions: any;
    collectionActions: any;
    collectionItems: any[any];
    post: (service: MovieSomServices, urlParams: string, payload: string) => Promise<any>;
}

export default class CollectionScreen extends React.PureComponent<Props, any> {
    static navigationOptions = {
        title: 'Collection'
    };

    state: any = {
        refreshing: true,
        collectionSearchText: '',
    };

    private loadingPage: number[] = [];

    componentDidMount() {
        if (!this.props.collectionItems || !this.props.collectionItems.length) {
            this.searchCollection();
        } else {
            AsyncStorage.getItem('collectionSearchText').then((collectionSearchText: string) => {
                this.setState({
                    refreshing: false,
                    collectionSearchText
                });
            });
        }
    }

    /**
     * Our backend returns all values as Strings even though some should be numbers.
     * We keep the backend as-is so it keeps working with legacy products.
     * So we have to sanitize the data ourselves here.
     */
    sanitize = (results: GetUsersMoviesListResult[]): GetUsersMoviesListResult[] => {
        const newResults = [...results];
        newResults.forEach((item: GetUsersMoviesListResult, idx: number, arr: GetUsersMoviesListResult[]) => {
            const newItem: GetUsersMoviesListResult = {
                ...item,
                want_to_watch: parseInt(`${item.want_to_watch}`, 10) || 0,
                first_air_date: item.release_date,
                name: item.title,
            };
            arr[idx] = newItem;
        });
        return newResults;
    }

    /**
     * Make sure the TMDb items in the Store are up-to-date.
     */
    updateStore = (results: GetUsersMoviesListResult[], replace: boolean = false, page: number, totalPages: number) => {
        const sanitizedResults = this.sanitize(results);
        console.log(sanitizedResults[0]);
        if (replace) {
            this.props.collectionActions.setCollectionItems(sanitizedResults);
        } else {
            // Add/merge to the `collection` Redux store when not replacing the collection results list.
            this.props.collectionActions.addCollectionItems(sanitizedResults);
        }
        // Add/merge items to the `tmdb` Redux store.
        this.props.actions.addItems(sanitizedResults);
        this.props.collectionActions.setCollectionPage(page);
        this.props.collectionActions.setCollectionTotalPages(totalPages);
    }

    loadNextPage = async () => {
        this.setState({refreshing: true});
        console.log('load next page', this.props.page < this.props.totalPages, this.loadingPage.indexOf(this.props.page) === -1);
        if (this.props.page < this.props.totalPages && this.loadingPage.indexOf(this.props.page) === -1) {
            await this.searchCollection(this.state.collectionSearchText, this.props.page + 1);
        }
        this.setState({refreshing: false});
    }

    searchCollection = async (query: string = '', page: number = 1) => {
        this.setState({refreshing: true});
        AsyncStorage.setItem('collectionSearchText', query);
        const payload: GetUsersMoviesList = {
            token: this.props.loginToken,
            query,
            filter_connection: '',
            watched_filter: 'true',
            blu_ray_filter: 'true',
            dvd_filter: 'true',
            digital_filter: 'true',
            other_filter: 'true',
            lend_out_filter: 'true',
            note_filter: 'true',
            spoiler_filter: 'true',
            sort: 'updated',
            all_filter: 'true',
            page
        };
        const response: GetUsersMoviesListResponse = await this.props.post('getUsersMoviesList', '', JSON.stringify(payload)).then((data: any) => data.json());
        if (page > 1) {
            this.updateStore(response.getUsersMoviesList.results, false, response.getUsersMoviesList.page, response.getUsersMoviesList.total_pages);
        } else {
            this.updateStore(response.getUsersMoviesList.results, true, response.getUsersMoviesList.page, response.getUsersMoviesList.total_pages);
        }
        this.setState({refreshing: false});
    }

    refresh = () => {
        this.props.collectionActions.setCollectionPage(1);
        this.searchCollection(this.state.collectionSearchText);
    }

    keyExtractor = (item: any, index: number) => `${item.id}${index}`;

    handleMoviePress = (movie: any) => {
        requestAnimationFrame(() => {
            this.props.navigation.push('MovieDetails', movie);
        });
    }

    handleTvPress = (tv: any) => {
        requestAnimationFrame(() => {
            this.props.navigation.push('TvDetails', tv);
        });
    }

    handlePersonPress = (person: any) => {
        requestAnimationFrame(() => {
            this.props.navigation.push('PersonDetails', person);
        });
    }

    render() {
        return this.props.loggedIn ? (
            <View style={viewStyle.view}>
                <FlatList
                    style={searchScreenStyle.flatList}
                    data={this.props.collectionItems}
                    extraData={this.props.collectionItems}
                    keyExtractor={this.keyExtractor}
                    ListEmptyComponent={<Text style={sectionListStyle.header}>Nothing found</Text>}
                    initialNumToRender={4}
                    renderItem={(data: any) => (
                        <SearchResultTemplate
                            {...data.item}
                            handleOnTvPress={this.handleTvPress}
                            handleOnMoviePress={this.handleMoviePress}
                            handleOnPersonPress={this.handlePersonPress}
                            navigation={this.props.navigation}
                        />
                    )}
                    refreshing={this.state.refreshing}
                    onRefresh={this.refresh}
                    onEndReached={this.loadNextPage}
                />
                <View style={searchScreenStyle.searchBar}>
                    <TextInput
                        accessibilityLabel='Search movie or tv series in your collection'
                        style={searchScreenStyle.searchInput}
                        onChangeText={(collectionSearchText: string) => { this.setState({collectionSearchText}); }}
                        placeholder='Search movie/tv series in your collection'
                        autoCorrect={false}
                        clearButtonMode='always'
                        keyboardType='web-search'
                        selectTextOnFocus={true}
                        underlineColorAndroid={transparentColor}
                        onSubmitEditing={(e: any) => {
                            this.props.collectionActions.setCollectionPage(1);
                            this.searchCollection(e.nativeEvent.text);
                        }}
                        enablesReturnKeyAutomatically={true}
                        value={this.state.collectionSearchText}
                    />
                </View>
            </View>
        ) :
        (
            <View style={viewStyle.view}>
                <Button title="Login" onPress={() => this.props.navigation.push('Login')}/>
            </View>
        );
    }
}