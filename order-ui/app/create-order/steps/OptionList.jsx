import _ from 'lodash';
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { Button, TextInput } from "susam-components/basic";
import { Grid, GridCell } from 'susam-components/layout';
import uuid from 'uuid';

var accented = {
    'A': '[Aa\xaa\xc0-\xc5\xe0-\xe5\u0100-\u0105\u01cd\u01ce\u0200-\u0203\u0226\u0227\u1d2c\u1d43\u1e00\u1e01\u1e9a\u1ea0-\u1ea3\u2090\u2100\u2101\u213b\u249c\u24b6\u24d0\u3371-\u3374\u3380-\u3384\u3388\u3389\u33a9-\u33af\u33c2\u33ca\u33df\u33ff\uff21\uff41]',
    'B': '[Bb\u1d2e\u1d47\u1e02-\u1e07\u212c\u249d\u24b7\u24d1\u3374\u3385-\u3387\u33c3\u33c8\u33d4\u33dd\uff22\uff42]',
    'C': '[Cc\xc7\xe7\u0106-\u010d\u1d9c\u2100\u2102\u2103\u2105\u2106\u212d\u216d\u217d\u249e\u24b8\u24d2\u3376\u3388\u3389\u339d\u33a0\u33a4\u33c4-\u33c7\uff23\uff43]',
    'Ç': '[Cc\xc7\xe7\u0106-\u010d\u1d9c\u2100\u2102\u2103\u2105\u2106\u212d\u216d\u217d\u249e\u24b8\u24d2\u3376\u3388\u3389\u339d\u33a0\u33a4\u33c4-\u33c7\uff23\uff43]',
    'D': '[Dd\u010e\u010f\u01c4-\u01c6\u01f1-\u01f3\u1d30\u1d48\u1e0a-\u1e13\u2145\u2146\u216e\u217e\u249f\u24b9\u24d3\u32cf\u3372\u3377-\u3379\u3397\u33ad-\u33af\u33c5\u33c8\uff24\uff44]',
    'E': '[Ee\xc8-\xcb\xe8-\xeb\u0112-\u011b\u0204-\u0207\u0228\u0229\u1d31\u1d49\u1e18-\u1e1b\u1eb8-\u1ebd\u2091\u2121\u212f\u2130\u2147\u24a0\u24ba\u24d4\u3250\u32cd\u32ce\uff25\uff45]',
    'F': '[Ff\u1da0\u1e1e\u1e1f\u2109\u2131\u213b\u24a1\u24bb\u24d5\u338a-\u338c\u3399\ufb00-\ufb04\uff26\uff46]',
    'G': '[Gg\u011c-\u0123\u01e6\u01e7\u01f4\u01f5\u1d33\u1d4d\u1e20\u1e21\u210a\u24a2\u24bc\u24d6\u32cc\u32cd\u3387\u338d-\u338f\u3393\u33ac\u33c6\u33c9\u33d2\u33ff\uff27\uff47]',
    'Ğ': '[Gg\u011c-\u0123\u01e6\u01e7\u01f4\u01f5\u1d33\u1d4d\u1e20\u1e21\u210a\u24a2\u24bc\u24d6\u32cc\u32cd\u3387\u338d-\u338f\u3393\u33ac\u33c6\u33c9\u33d2\u33ff\uff27\uff47]',
    'H': '[Hh\u0124\u0125\u021e\u021f\u02b0\u1d34\u1e22-\u1e2b\u1e96\u210b-\u210e\u24a3\u24bd\u24d7\u32cc\u3371\u3390-\u3394\u33ca\u33cb\u33d7\uff28\uff48]',
    'I': '[Ii\xcc-\xcf\xec-\xef\u0128-\u0130\u0132\u0133\u01cf\u01d0\u0208-\u020b\u1d35\u1d62\u1e2c\u1e2d\u1ec8-\u1ecb\u2071\u2110\u2111\u2139\u2148\u2160-\u2163\u2165-\u2168\u216a\u216b\u2170-\u2173\u2175-\u2178\u217a\u217b\u24a4\u24be\u24d8\u337a\u33cc\u33d5\ufb01\ufb03\uff29\uff49]',
    'İ': '[Ii\xcc-\xcf\xec-\xef\u0128-\u0130\u0132\u0133\u01cf\u01d0\u0208-\u020b\u1d35\u1d62\u1e2c\u1e2d\u1ec8-\u1ecb\u2071\u2110\u2111\u2139\u2148\u2160-\u2163\u2165-\u2168\u216a\u216b\u2170-\u2173\u2175-\u2178\u217a\u217b\u24a4\u24be\u24d8\u337a\u33cc\u33d5\ufb01\ufb03\uff29\uff49]',
    'J': '[Jj\u0132-\u0135\u01c7-\u01cc\u01f0\u02b2\u1d36\u2149\u24a5\u24bf\u24d9\u2c7c\uff2a\uff4a]',
    'K': '[Kk\u0136\u0137\u01e8\u01e9\u1d37\u1d4f\u1e30-\u1e35\u212a\u24a6\u24c0\u24da\u3384\u3385\u3389\u338f\u3391\u3398\u339e\u33a2\u33a6\u33aa\u33b8\u33be\u33c0\u33c6\u33cd-\u33cf\uff2b\uff4b]',
    'L': '[Ll\u0139-\u0140\u01c7-\u01c9\u02e1\u1d38\u1e36\u1e37\u1e3a-\u1e3d\u2112\u2113\u2121\u216c\u217c\u24a7\u24c1\u24db\u32cf\u3388\u3389\u33d0-\u33d3\u33d5\u33d6\u33ff\ufb02\ufb04\uff2c\uff4c]',
    'M': '[Mm\u1d39\u1d50\u1e3e-\u1e43\u2120\u2122\u2133\u216f\u217f\u24a8\u24c2\u24dc\u3377-\u3379\u3383\u3386\u338e\u3392\u3396\u3399-\u33a8\u33ab\u33b3\u33b7\u33b9\u33bd\u33bf\u33c1\u33c2\u33ce\u33d0\u33d4-\u33d6\u33d8\u33d9\u33de\u33df\uff2d\uff4d]',
    'N': '[Nn\xd1\xf1\u0143-\u0149\u01ca-\u01cc\u01f8\u01f9\u1d3a\u1e44-\u1e4b\u207f\u2115\u2116\u24a9\u24c3\u24dd\u3381\u338b\u339a\u33b1\u33b5\u33bb\u33cc\u33d1\uff2e\uff4e]',
    'O': '[Oo\xba\xd2-\xd6\xf2-\xf6\u014c-\u0151\u01a0\u01a1\u01d1\u01d2\u01ea\u01eb\u020c-\u020f\u022e\u022f\u1d3c\u1d52\u1ecc-\u1ecf\u2092\u2105\u2116\u2134\u24aa\u24c4\u24de\u3375\u33c7\u33d2\u33d6\uff2f\uff4f]',
    'Ö': '[Oo\xba\xd2-\xd6\xf2-\xf6\u014c-\u0151\u01a0\u01a1\u01d1\u01d2\u01ea\u01eb\u020c-\u020f\u022e\u022f\u1d3c\u1d52\u1ecc-\u1ecf\u2092\u2105\u2116\u2134\u24aa\u24c4\u24de\u3375\u33c7\u33d2\u33d6\uff2f\uff4f]',
    'P': '[Pp\u1d3e\u1d56\u1e54-\u1e57\u2119\u24ab\u24c5\u24df\u3250\u3371\u3376\u3380\u338a\u33a9-\u33ac\u33b0\u33b4\u33ba\u33cb\u33d7-\u33da\uff30\uff50]',
    'Q': '[Qq\u211a\u24ac\u24c6\u24e0\u33c3\uff31\uff51]',
    'R': '[Rr\u0154-\u0159\u0210-\u0213\u02b3\u1d3f\u1d63\u1e58-\u1e5b\u1e5e\u1e5f\u20a8\u211b-\u211d\u24ad\u24c7\u24e1\u32cd\u3374\u33ad-\u33af\u33da\u33db\uff32\uff52]',
    'S': '[Ss\u015a-\u0161\u017f\u0218\u0219\u02e2\u1e60-\u1e63\u20a8\u2101\u2120\u24ae\u24c8\u24e2\u33a7\u33a8\u33ae-\u33b3\u33db\u33dc\ufb06\uff33\uff53]',
    'Ş': '[Ss\u015a-\u0161\u017f\u0218\u0219\u02e2\u1e60-\u1e63\u20a8\u2101\u2120\u24ae\u24c8\u24e2\u33a7\u33a8\u33ae-\u33b3\u33db\u33dc\ufb06\uff33\uff53]',
    'T': '[Tt\u0162-\u0165\u021a\u021b\u1d40\u1d57\u1e6a-\u1e71\u1e97\u2121\u2122\u24af\u24c9\u24e3\u3250\u32cf\u3394\u33cf\ufb05\ufb06\uff34\uff54]',
    'U': '[Uu\xd9-\xdc\xf9-\xfc\u0168-\u0173\u01af\u01b0\u01d3\u01d4\u0214-\u0217\u1d41\u1d58\u1d64\u1e72-\u1e77\u1ee4-\u1ee7\u2106\u24b0\u24ca\u24e4\u3373\u337a\uff35\uff55]',
    'Ü': '[Uu\xd9-\xdc\xf9-\xfc\u0168-\u0173\u01af\u01b0\u01d3\u01d4\u0214-\u0217\u1d41\u1d58\u1d64\u1e72-\u1e77\u1ee4-\u1ee7\u2106\u24b0\u24ca\u24e4\u3373\u337a\uff35\uff55]',
    'V': '[Vv\u1d5b\u1d65\u1e7c-\u1e7f\u2163-\u2167\u2173-\u2177\u24b1\u24cb\u24e5\u2c7d\u32ce\u3375\u33b4-\u33b9\u33dc\u33de\uff36\uff56]',
    'W': '[Ww\u0174\u0175\u02b7\u1d42\u1e80-\u1e89\u1e98\u24b2\u24cc\u24e6\u33ba-\u33bf\u33dd\uff37\uff57]',
    'X': '[Xx\u02e3\u1e8a-\u1e8d\u2093\u213b\u2168-\u216b\u2178-\u217b\u24b3\u24cd\u24e7\u33d3\uff38\uff58]',
    'Y': '[Yy\xdd\xfd\xff\u0176-\u0178\u0232\u0233\u02b8\u1e8e\u1e8f\u1e99\u1ef2-\u1ef9\u24b4\u24ce\u24e8\u33c9\uff39\uff59]',
    'Z': '[Zz\u0179-\u017e\u01f1-\u01f3\u1dbb\u1e90-\u1e95\u2124\u2128\u24b5\u24cf\u24e9\u3390-\u3394\uff3a\uff5a]'
};
export class OptionList extends TranslatingComponent{
    
    constructor(props){
        super(props);
        this.state = {focusIndex: 0, options: this.props.options}
        this.searchInputId = uuid.v4();
    }
    componentDidMount(){
        if(this.props.enableArrowKeys){
            document.addEventListener('keyup', this.handleKeyPress);
        }
        this.focusOn(this.searchInputId);
    }
    componentWillReceiveProps(nextProps){
        if(this.props.enableArrowKeys && !nextProps.enableArrowKeys){
            document.removeEventListener('keyup', this.handleKeyPress);
        }
        if(!this.props.enableArrowKeys && nextProps.enableArrowKeys){
            document.addEventListener('keyup', this.handleKeyPress);
        }
        if(nextProps.options != this.props.options){
            this.setState({options: nextProps.options});
        }
    }
    componentWillUnmount(){
        document.removeEventListener('keyup', this.handleKeyPress);
    }
    
    focusOn(elementId){
        document.getElementById(elementId) && document.getElementById(elementId).focus();
    }

    handleToggleShowAllClick(){
        this.setState(prevState => ({showAll: !prevState.showAll}));
    }

    handleKeyPress = (e) => {
        if(e.key === "Enter"){
            this.handleSelect(this.state.options[this.state.focusIndex]);
        }else{
            this.navigate(e.key);
        }
    };
    handleMultipleSelect(option){
        let value = _.cloneDeep(this.props.value) || [];
        let keyField = this.keyField();
        let index = _.findIndex(value, (item) => item[keyField] === option[keyField]);
        if(index >= 0){
            value.splice(index, 1);
        }else{
            value.push(option);
        }
        this.props.onChange && this.props.onChange(value);
    }
    handleSingleSelect(option){
        this.props.onChange && this.props.onChange(option);
    }
    handleSelect(option, selected) {
        if (this.props.multiple) {
            this.handleMultipleSelect(option);
        } else {
            if(this.props.unselectable && selected){
                this.handleSingleSelect({});
            } else {
                this.handleSingleSelect(option);
            }
        }
    }
    keyField(){
        return this.props.keyField || "id";
    }
    navigate(key){
        let focusIndex = 0;
        if(key === "ArrowRight"){
            focusIndex = this.state.focusIndex + 1 < this.state.options.length ? this.state.focusIndex + 1 : 0;
        }
        if(key === "ArrowLeft"){
            focusIndex = this.state.focusIndex - 1 >= 0 ? this.state.focusIndex - 1 : this.state.options.length - 1;
        }
        this.setState({focusIndex: focusIndex});
    }

    make_pattern(search_string) {
        // escape meta characters
        search_string = search_string.replace(/([|()[{.+*?^$\\])/g,"\\$1");
    
        // split into words
        var words = search_string.split(/\s+/);
    
        // sort by length
        var length_comp = function (a,b) {
            return b.length - a.length;
        };
        words.sort(length_comp);
    
        // replace characters by their compositors
        var accent_replacer = function(chr) {
            return accented[chr.toUpperCase()] || chr;
        }
        for (var i = 0; i < words.length; i++) {
            words[i] = words[i].replace(/\S/g,accent_replacer);
        }
    
        // join as alternatives
        var regexp = words.join("|");
        return new RegExp(regexp,'g');
    }
    
    matcher(option, input) {
        let keys = [];
        if (this.props.searchFields) {
            _.each(this.props.searchFields, field => {
                let value = _.get(option, field);
                if(value){
                    if (_.isString(value) && 0 <= value.toLocaleUpperCase(navigator.language).search(this.make_pattern(input))) {
                        keys.push(field);
                    } else if (_.isObject(value) && this.matcher(value, input)) {
                        keys.push(field);
                    }
                }
            });
        } else {
            _.each(option, (value, key) => {
                if (value) {
                    if (_.isString(value) && 0 <= value.toLocaleUpperCase(navigator.language).search(this.make_pattern(input))) {
                        keys.push(key);
                    } else if (_.isObject(value) && this.matcher(value, input)) {
                        keys.push(key);
                    }
                }
            });
        }
        return !_.isEmpty(keys);
    }

    handleSearch(searchValue) {
        let value = searchValue.split(" ").filter(o=>!_.isEmpty(o));
        let filtered = this.props.options;
        value.forEach(token=>{
            filtered = _.intersection(filtered, _.filter(this.props.options, o => this.matcher(o, token)));
        })
        let result = _.isEmpty(value)? this.props.options : filtered;
        this.setState({
            options: result,
            searchValue: searchValue
        });
    }

    renderSearchInput() {
        return this.props.showSearchInput ?
            (
                <Grid smallGutter = {true}>
                    <GridCell width="4-5" noMargin={true} divider={true}>
                        <div lang={navigator.language} style={{ textTransform: "uppercase", marginTop: "-24px", marginBottom: "12px" }}>
                            <TextInput id={this.searchInputId} value={this.state.searchValue} onchange={value => this.handleSearch(value.toLocaleUpperCase(navigator.language))} />
                        </div>
                    </GridCell>
                    <GridCell width="1-5" noMargin={true}>
                        <div className={"md-input-filled"}>
                            <label>{super.translate("Total Number of Locations")}:</label><b style={{float: "right"}}>{this.props.options.length}</b>
                        </div>
                    </GridCell>
                </Grid>
            ) : null;
    }

    adjustOptions(){
        let size = this.props.size || this.state.options.length;
        let opts = _.slice(this.state.options, 0, size);
        return opts;
    }

    render(){
        if(!this.state.options){
            return null;
        }
        let columns = this.props.columns ? this.props.columns : 3;
        let value = [];
        if(this.props.value){
            value = _.isArray(this.props.value) ? this.props.value : [this.props.value];
        }
        let keyField = this.keyField();
        
        
        let optionsToShow = this.state.showAll ? this.state.options : this.adjustOptions();
        
        let optionBoxes = optionsToShow.map((option, index) => {
            let selected = _.findIndex(value, (item) => item[keyField] === option[keyField]) >= 0;
            let focused = this.props.enableArrowKeys && index === this.state.focusIndex;
            return (
                <GridCell key = {option[keyField]} width = {"1-" + columns}>
                    <OptionBox selected = {selected} focused = {focused}
                               onSelect = {() => this.handleSelect(option, selected)}
                               onRender = {() => this.props.onRender(option, selected, focused)}/>
                </GridCell>
            );
        });

        let showAllTitle = this.state.showAll ? "Show Less" : "Show All";
        let showAllButton = this.props.size && this.state.options.length > this.props.size ? 
            <div style={{textAlign:"right"}}><Button label = {showAllTitle} size = "mini" flat = {true} style = "success"
                    onclick = {() => this.handleToggleShowAllClick()} /></div> : null


        return (
            <div>
                {this.renderSearchInput()}
                <div tabIndex = "0" style = {{outline: "none"}}>
                    <Grid smallGutter = {true}>
                        {optionBoxes}
                    </Grid>
                    <div>
                        {showAllButton}
                    </div>
                </div>
            </div>
        );
    }

}
export class OptionBox extends React.Component{

    handleSelect(){
        this.props.onSelect && this.props.onSelect();
    }

    render(){
        let style = {
            border: "1px solid #e0e0e0",
            cursor: "pointer",
            borderRadius: "3px",
            padding: "12px",
            position: "relative",
            marginBottom: "8px"
        };
        let check = null;
        if(this.props.selected){
            style.backgroundColor = "#64b5f6";
            style.color = "#FFFFFF";
            style.border = "1px solid #2196f3";
            check = <i className="uk-icon uk-icon-check uk-icon-medsmall2 uk-text-contrast"
                       style = {{position: "absolute", right: "0px", top: "0px"}} />;
        }
        if(this.props.focused){
            style.border = "1px solid #2196f3";
        }
        if(this.props.selected && this.props.focused){
            style.border = "1px solid #1976d2";
        }

        return(
            <div style = {style} onClick = {() => this.handleSelect()}>
                {check}
                {this.props.onRender()}
            </div>

        );
    }
}

OptionList.contextTypes = {
    translator: PropTypes.object
};