import React from 'react';
import { Text, ScrollView, View, Image, Animated, Dimensions } from 'react-native';
import { detailStyle, HEADER_MAX_HEIGHT, animatedHeaderStyle, HEADER_SCROLL_DISTANCE, HEADER_MIN_HEIGHT, backgroundColor} from "../styles/Styles";
import { format, parse } from 'date-fns';
import MovieIcons from '../components/icons/MovieIcons';
import numeral from 'numeral';
import { MaterialCommunityIcons, MaterialIcons, Ionicons, Octicons } from '@expo/vector-icons';
import Touchable from '../components/Touchable';
import { MovieProps, GetUserMoviesSettingsResponse } from '../interfaces/Movie';
import LabeledSwitch from '../components/LabeledSwitch';
import MediumSwitches from '../components/MediumSwitches';

numeral.register('locale', 'nl_NL', {
    delimiters: {
        thousands: '.',
        decimal: ','
    },
    abbreviations: {
        thousand: 'k',
        million: 'm',
        billion: 'b',
        trillion: 't'
    },
    currency: {
        symbol: '$'
    }
} as any);

numeral.locale('nl_NL');

export interface Props extends MovieProps, GetUserMoviesSettingsResponse {
    actions: any;
    loginToken: string;
    navigation: any;
    formatDuration: any;
    get: (route: string, uriParam: string) => Promise<any>;
    post: (service: string, uriParam?: string, body?: string, baseUrl?: string, apiVersion?: string) => Promise<any>;
    getBackdropUrl: (backdropPath: string|null|undefined, quality?: number) => Promise<any>;
}

export default class MovieDetailScreen extends React.PureComponent<Props, any> {
    static navigationOptions = {
        title: 'Movie Details',
    };

    state: any = {
        scrollY: new Animated.Value(0),
    };

    constructor(props: Props) {
        super(props);
        Dimensions.addEventListener('change', ({window, screen}) => { this.checkOrientation(window.width, window.height); });
        const {width, height} = Dimensions.get('window');
        this.checkOrientation(width, height);
        this.getDetails();
    }

    checkOrientation = (width: number, height: number) => {
        console.log('Landscape', (width > height));
        this.props.navigation.setParams({hideTabBar: (width > height)});
    }

    getDetails = async () => {
        console.log('Get movie details');
        const item = await this.props.get(`/movie/${this.props.id}`, `append_to_response=${encodeURI('videos,credits,alternative_titles')}`).then((data) => data.json());
        item.media_type = 'movie';
        await this.loadImage(item.backdrop_path);
        this.props.actions.addItem(item);
        this.props.actions.addItems(await this.props.getUserMoviesSettings([{...this.props}], this.props.loginToken));
        const tmdbItem = {
            ...item,
            tmdb_id: item.id,
            tmdb_rating: item.vote_average,
            tmdb_votes: item.vote_count
        };
        await this.props.post('setMovieRatings', '', JSON.stringify(tmdbItem));
    }

    /**
     * Tries to load the image from the given URL. It determines the width and height which
     * is required in order to show the image. Otherwise it will be 0x0.
     * When all conditions are met the `image` state is set with a JSX Element triggering
     * a re-render.
     */
    loadImage = async (imagePath: string|null|undefined) => {
        const imageUrl = await this.props.getBackdropUrl(imagePath);
        if (imageUrl) {
            Image.getSize(imageUrl, (width: number, height: number) => {
                this.setState({imageUrl});
            }, (e: any) => { console.error(e); });
        } else {
            console.log('backdrop path not found', imageUrl);
        }
    }

    handleOnBluRay = (newValue: boolean) => {
        const payload = {
            token: this.props.loginToken,
            id: this.props.id,
            tmdb_id: this.props.id,
            media_type: 'movie',
            blu_ray: newValue ? '1' : '0'
        };
        this.props.actions.addItem(payload);
        this.props.post('setUserMovieBluRay', '', JSON.stringify(payload));
    }

    handleOnDvd = (newValue: boolean) => {
        const payload = {
            token: this.props.loginToken,
            id: this.props.id,
            tmdb_id: this.props.id,
            media_type: 'movie',
            dvd: newValue ? '1' : '0'
        };
        this.props.actions.addItem(payload);
        this.props.post('setUserMovieDvd', '', JSON.stringify(payload))
        .then((data: any) => data.json())
        .then((data: any) => {
            console.log(data);
        });
    }

    handleOnDigital = (newValue: boolean) => {
        const payload = {
            token: this.props.loginToken,
            id: this.props.id,
            tmdb_id: this.props.id,
            media_type: 'movie',
            digital: newValue ? '1' : '0'
        };
        this.props.actions.addItem(payload);
        this.props.post('setUserMovieDigital', '', JSON.stringify(payload));
    }

    handleOnOther = (newValue: boolean) => {
        const payload = {
            token: this.props.loginToken,
            id: this.props.id,
            tmdb_id: this.props.id,
            media_type: 'movie',
            other: newValue ? '1' : '0'
        };
        this.props.actions.addItem(payload);
        this.props.post('setUserMovieOther', '', JSON.stringify(payload));
    }

    render() {
        const headerHeight = this.state.scrollY.interpolate({
            inputRange: [0, HEADER_SCROLL_DISTANCE],
            outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
            extrapolate: 'clamp',
        });
        const imageOpacity = this.state.scrollY.interpolate({
            inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
            outputRange: [1, 1, 0.4],
            extrapolate: 'clamp',
        });

        const imageTranslate = this.state.scrollY.interpolate({
            inputRange: [0, HEADER_SCROLL_DISTANCE],
            outputRange: [0, -50],
            extrapolate: 'clamp',
        });

        return (
            <View style={{backgroundColor}}>
                <ScrollView
                    scrollEventThrottle={1}
                    onScroll={Animated.event(
                        [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}]
                    )}
                    style={{backgroundColor, minHeight: '100%'}}
                >
                    <Text
                        style={{
                            width: 360,
                            height: HEADER_MAX_HEIGHT,
                        }}
                    />
                    <Touchable style={{marginTop: HEADER_MAX_HEIGHT}}>
                        <View style={{backgroundColor, margin: 10}}>
                            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                                {this.props.blu_ray === "1" ? <Image style={{width: 20}} resizeMode='contain' source={require('../../img/blu-ray.png')}/> : null}
                                {this.props.dvd === "1" ? <Image style={{marginLeft: 5, width: 20}} resizeMode='contain' source={require('../../img/dvd.png')}/> : null}
                                {this.props.digital === "1" ? <Octicons name="file-binary" size={10} style={{marginLeft: 5}}/> : null}
                                {this.props.other === "1" ? <MaterialIcons name="devices-other" size={10} style={{marginLeft: 5}}/> : null}
                            </View>
                            <Text style={detailStyle.title}>{this.props.title}{this.props.release_date ? ` (${format(parse(this.props.release_date as string), 'YYYY')})` : null}</Text>
                            <View style={detailStyle.metaView}>
                                {this.props.budget ? <Text style={[detailStyle.metaText]}>Budget: {numeral(this.props.budget).format('$0,0')}</Text> : null}
                                {this.props.revenue ? <Text style={[detailStyle.metaText]}>Revenue: {numeral(this.props.revenue).format('$0,0')}</Text> : null}
                                {this.props.runtime ? <Text style={[detailStyle.metaText]}><MaterialCommunityIcons name="timer-sand" size={13}/> {this.props.formatDuration ? this.props.formatDuration(this.props.runtime) : this.props.runtime}</Text> : null}
                                {this.props.vote_average ?
                                    <Text style={[detailStyle.metaText]}>
                                        <MaterialIcons name="thumbs-up-down" size={13}/> {this.props.vote_average}
                                        {this.props.vote_count ? <Text> <Ionicons name="ios-people" size={13}/> {this.props.vote_count}</Text> : null}
                                    </Text> : null}
                            </View>
                            <Text style={detailStyle.overview}>{this.props.overview}</Text>
                            <MovieIcons {...this.props}/>

                            <MediumSwitches
                                handleOnBluRay={this.handleOnBluRay}
                                handleOnDvd={this.handleOnDvd}
                                handleOnDigital={this.handleOnDigital}
                                handleOnOther={this.handleOnOther}
                                blu_ray={this.props.blu_ray}
                                dvd={this.props.dvd}
                                digital={this.props.digital}
                                other={this.props.other}
                            />
                        </View>
                    </Touchable>
                </ScrollView>
                <Animated.View style={[animatedHeaderStyle.header, {height: headerHeight}]}>
                    <Animated.Image
                        style={[
                            animatedHeaderStyle.backgroundImage,
                            {
                                opacity: imageOpacity,
                                transform: [{translateY: imageTranslate}]
                            },
                        ]}
                        loadingIndicatorSource={require('../../assets/eyecon360x219.png')}
                        defaultSource={require('../../assets/eyecon360x219.png')}
                        resizeMode='cover'
                        source={this.state.imageUrl ? {uri: this.state.imageUrl} : require('../../assets/eyecon360x219.png')}
                    />
                </Animated.View>
            </View>
        );
    }
}
