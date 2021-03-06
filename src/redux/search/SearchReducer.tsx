import * as SearchActions from './SearchActions';
import { bindActionCreators } from 'redux';
import { ADD_SEARCH_ITEM, SET_SEARCH_ITEMS, ADD_SEARCH_ITEMS, SET_SEARCH_TOTAL_PAGES, SET_SEARCH_PAGE } from './SearchActions';
import { anonymizeItems } from '../rootReducer';

const defaultState = {
    searchItems: []
};

const addSearchItem = (newState: any, item: any) => {
    const itemState = newState.searchItems.find((value: any, index: number, arr: any[]) => {
        const sameItem = (value.id === item.id && value.media_type === item.media_type);
        if (sameItem) {
            // console.log('MERGE search item', item.media_type, item.id);
            arr[index] = {...value, ...item};
        }
        return sameItem;
    });
    if (!itemState) {
        // console.log('INSERT search item', item.media_type, item.id);
        newState.searchItems.push(item);
    }
    return newState;
};

export function searchReducer(state: any = defaultState, action: any) {
    let newState = {...state};
    switch (action.type) {
        case ADD_SEARCH_ITEM:
            // console.log('ADD search item');
            return addSearchItem(newState, action.item);
        case ADD_SEARCH_ITEMS:
            // console.log('ADD search items');
            action.items.forEach((item: any) => {
                newState = addSearchItem(newState, item);
            });
            return newState;
        case SET_SEARCH_ITEMS:
            // console.log('REPLACE search items');
            newState.searchItems = action.items;
            return newState;
        case SET_SEARCH_PAGE:
            newState.page = action.page;
            return newState;
        case SET_SEARCH_TOTAL_PAGES:
            newState.totalPages = action.totalPages;
            return newState;
        case "LOGOUT":
            return {searchItems: anonymizeItems(newState.searchItems)};
       default:
            return newState;
    }
}

export function mapSearchStateToProps(state: any, ownProps: any) {
    return {
        ...(state.search.searchItems.find((value: any) => {
            let result = false;
            if (ownProps.navigation) {
                result = (ownProps.navigation.getParam('id') === value.id && ownProps.navigation.getParam('media_type') === value.media_type) ||
                (value.id === ownProps.id && value.media_type === ownProps.media_type);
            } else {
                result = (value.id === ownProps.id);
            }
            return result;
        })),
        page: state.search.page,
        totalPages: state.search.totalPages,
        searchItems: state.search.searchItems,
    };
}

export function mapSearchDispatchToProps(dispatch: any, ownProps: any) {
    return {
        searchActions: bindActionCreators(SearchActions as any, dispatch)
    };
}
