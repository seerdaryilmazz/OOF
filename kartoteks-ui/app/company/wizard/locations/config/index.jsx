export {AddressForAny} from './AddressForAny';
import {AddressForAny} from './AddressForAny';
export {AddressForTR} from './AddressForTR';
import {AddressForTR} from './AddressForTR';
export {AddressForGB} from './AddressForGB';
import {AddressForGB} from './AddressForGB';
export {AddressForES} from './AddressForES';
import {AddressForES} from './AddressForES';
export {AddressForIT} from './AddressForIT';
import {AddressForIT} from './AddressForIT';
export {AddressForFR} from './AddressForFR';
import {AddressForFR} from './AddressForFR';
export {AddressForGR} from './AddressForGR';
import {AddressForGR} from './AddressForGR';
export {AddressForSE} from './AddressForSE';
import {AddressForSE} from './AddressForSE';
export {AddressForCZ} from './AddressForCZ';
import {AddressForCZ} from './AddressForCZ';
export {AddressForCN} from './AddressForCN';
import {AddressForCN} from './AddressForCN';
export {AddressForHU} from './AddressForHU';
import {AddressForHU} from './AddressForHU';
export {AddressForUS} from './AddressForUS';
import {AddressForUS} from './AddressForUS';
export {AddressForIR} from './AddressForIR';
import {AddressForIR} from './AddressForIR';
export {AddressForNO} from './AddressForNO';
import {AddressForNO} from './AddressForNO';
export {AddressForIE} from './AddressForIE';
import {AddressForIE} from './AddressForIE';
export {AddressForSK} from './AddressForSK';
import {AddressForSK} from './AddressForSK';
export {AddressForSI} from './AddressForSI';
import {AddressForSI} from './AddressForSI';

export const AddressConfig = {
    TR: new AddressForTR(),
    GB: new AddressForGB(),
    ES: new AddressForES(),
    IT: new AddressForIT(),
    FR: new AddressForFR(),
    GR: new AddressForGR(),
    SE: new AddressForSE(),
    CZ: new AddressForCZ(),
    CN: new AddressForCN(),
    HU: new AddressForHU(),
    US: new AddressForUS(),
    IR: new AddressForIR(),
    NO: new AddressForNO(),
    IE: new AddressForIE(),
    SK: new AddressForSK(),
    SI: new AddressForSI(),
    DEFAULT: new AddressForAny()
}