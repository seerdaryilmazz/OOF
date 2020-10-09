
export class RenderingComponent {

    static render(component) {

        if (component.props.hidden) {
            if(component.renderHidden){
                return component.renderHidden();
            }else{
                return null;
            }
        } else if (component.props.readOnly) {
            return component.renderReadOnly();
        }
        else {
            return component.renderStandard();
        }
    }

}