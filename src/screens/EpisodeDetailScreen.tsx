import React from 'react';
import { Text, ScrollView, View, Animated, Image, Dimensions } from 'react-native';
import {detailStyle, HEADER_SCROLL_DISTANCE, HEADER_MAX_HEIGHT, animatedHeaderStyle, backgroundColor} from "../styles/Styles";
import { Octicons, MaterialIcons } from '@expo/vector-icons';
import {EpisodeProps, GetUserTvEpisodesSettingsResponse} from "../interfaces/Episode";
import EpisodeIcons from "../components/icons/EpisodeIcons";
import MediumSwitches from '../components/MediumSwitches';
import { MovieSomServices } from '../moviesom/MovieSom';
import {format, parse} from "date-fns";

export interface Props extends EpisodeProps, GetUserTvEpisodesSettingsResponse {
    actions: any;
    loginToken: string;
    loggedIn: boolean;
    navigation: any;
    formatDuration: any;
    get: (route: string, uriParam: string) => Promise<any>;
    post: (service: MovieSomServices, uriParam?: string, body?: string, baseUrl?: string, apiVersion?: string) => Promise<any>;
    getBackdropUrl: (backdropPath: string|null|undefined, quality?: number) => Promise<any>;
}
export default class EpisodeDetailScreen extends React.PureComponent<Props, any> {
    static navigationOptions = {
        title: 'Episode details',
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
        this.props.navigation.setParams({hideTabBar: (width > height)});
    }

    getDetails = async () => {
        console.log('Get episode details');
        const item = await this.props.get(`/tv/${this.props.tv_id}/season/${this.props.season_number}/episode/${this.props.episode_number}`, `append_to_response=${encodeURI('videos,credits,alternative_titles')}`).then((data) => data.json());
        item.media_type = 'episode';
        await this.loadImage(item.still_path);
        this.props.actions.addItem(item);
        this.props.actions.addItems(await this.props.getUserEpisodeSettings([{...this.props}], this.props.loginToken));
        const tmdbItem = {
            ...item,
            tmdb_id: item.id,
            tmdb_rating: item.vote_average,
            tmdb_votes: item.vote_count
        };
        await this.props.post('setTvEpisodeRatings', '', JSON.stringify(tmdbItem));
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

    getFormattedEpisodeRunTime = (episodeRunTime: number[]) => {
        const result: number[] = [];
        episodeRunTime.forEach((duration: number) => {
            result.push(this.props.formatDuration(duration));
        });
        return result.join(', ');
    }

    handleOnBluRay = (newValue: boolean) => {
        if (!this.props.loggedIn) {
            this.props.navigation.push('Login', {
                loginReason: 'Log in to add this episode to your Blu-Ray collection.'
            });
            return;
        }
        const payload = {
            token: this.props.loginToken,
            id: this.props.id,
            tmdb_id: this.props.id,
            media_type: 'episode',
            blu_ray: newValue ? '1' : '0'
        };
        this.props.actions.addItem(payload);
        this.props.post('setUserTvEpisodeBluRay', '', JSON.stringify(payload));
    }

    handleOnDvd = (newValue: boolean) => {
        if (!this.props.loggedIn) {
            this.props.navigation.push('Login', {
                loginReason: 'Log in to add this episode to your DVD collection.'
            });
            return;
        }
        const payload = {
            token: this.props.loginToken,
            id: this.props.id,
            tmdb_id: this.props.id,
            media_type: 'episode',
            dvd: newValue ? '1' : '0'
        };
        this.props.actions.addItem(payload);
        this.props.post('setUserTvEpisodeDvd', '', JSON.stringify(payload));
    }

    handleOnDigital = (newValue: boolean) => {
        if (!this.props.loggedIn) {
            this.props.navigation.push('Login', {
                loginReason: 'Log in to add this episode to your Digital collection.'
            });
            return;
        }
        const payload = {
            token: this.props.loginToken,
            id: this.props.id,
            tmdb_id: this.props.id,
            media_type: 'episode',
            digital: newValue ? '1' : '0'
        };
        this.props.actions.addItem(payload);
        this.props.post('setUserTvEpisodeDigital', '', JSON.stringify(payload));
    }

    handleOnOther = (newValue: boolean) => {
        if (!this.props.loggedIn) {
            this.props.navigation.push('Login', {
                loginReason: 'Log in to add this episode to your collection.'
            });
            return;
        }
        const payload = {
            token: this.props.loginToken,
            id: this.props.id,
            tmdb_id: this.props.id,
            media_type: 'episode',
            other: newValue ? '1' : '0'
        };
        this.props.actions.addItem(payload);
        this.props.post('setUserTvEpisodeOther', '', JSON.stringify(payload));
    }

    render() {
        const imageOpacity = this.state.scrollY.interpolate({
            inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
            outputRange: [1, 1, 0.4],
            extrapolate: 'clamp',
        });

        const imageTranslate = this.state.scrollY.interpolate({
            inputRange: [0, HEADER_SCROLL_DISTANCE],
            outputRange: [0, -100],
            extrapolate: 'clamp',
        });
        return (
            <View style={{backgroundColor}}>
                <Animated.View style={[animatedHeaderStyle.header, {height: HEADER_MAX_HEIGHT}]}>
                    <Animated.Image
                        style={[
                            animatedHeaderStyle.backgroundImage,
                            {
                                opacity: imageOpacity,
                                transform: [{translateY: imageTranslate}]
                            },
                        ]}
                        loadingIndicatorSource={require('../../assets/eyecon360x219.png')}
                        resizeMode='cover'
                        source={this.state.imageUrl ? {uri: this.state.imageUrl} : require('../../assets/eyecon360x219.png')}
                    />
                </Animated.View>
                <ScrollView
                    scrollEventThrottle={1}
                    onScroll={Animated.event(
                        [{nativeEvent: {contentOffset: {y: this.state.scrollY}}}]
                    )}
                    style={{backgroundColor: 'transparent', height: '100%'}}
                >
                    <View style={{backgroundColor, padding: 10, marginTop: HEADER_MAX_HEIGHT}}>
                        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                            {this.props.blu_ray === "1" ? <Image style={{width: 20}} resizeMode='contain' source={require('../../img/blu-ray.png')}/> : null}
                            {this.props.dvd === "1" ? <Image style={{marginLeft: 5, width: 20}} resizeMode='contain' source={require('../../img/dvd.png')}/> : null}
                            {this.props.digital === "1" ? <Octicons name="file-binary" size={10} style={{marginLeft: 5}}/> : null}
                            {this.props.other === "1" ? <MaterialIcons name="devices-other" size={10} style={{marginLeft: 5}}/> : null}
                        </View>
                        <Text style={detailStyle.title}>{this.props.episode_number ? `#${this.props.episode_number} ` : ''}{this.props.name}</Text>
                        <View style={detailStyle.metaView}>
                            {this.props.air_date ? <Text style={[detailStyle.metaText]}>First aired: {format(parse(this.props.air_date as string), 'dddd DD-MM-YYYY')}</Text> : null}
                            {this.props.season_number ? <Text style={[detailStyle.metaText]}>Season: {this.props.season_number}</Text> : null}
                            {this.props.episode_number ? <Text style={[detailStyle.metaText]}>Episode: {this.props.episode_number}</Text> : null}
                        </View>
                        <Text style={detailStyle.overview}>{this.props.overview}</Text>
                        <EpisodeIcons {...this.props}/>

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
                </ScrollView>
            </View>
        );
    }
}
