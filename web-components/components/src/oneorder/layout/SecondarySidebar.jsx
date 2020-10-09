

export class SecondarySidebar {

    constructor(){

    }
    hideSidebar() {
        window.console&&console.log('hideSidebar');
        this.$body.removeClass('sidebar_secondary_active');
    };
    showSidebar() {
        this.$body.addClass('sidebar_secondary_active');
    };

    init(){
        this.$sidebarSecondary = $('#sidebar_secondary');
        this.$sidebarSecondaryToggle = $('#sidebar_secondary_toggle');
        this.$body = $('body');
        this.$document = $('document');

        if(this.$sidebarSecondary.length) {
            this.$sidebarSecondaryToggle.removeClass('sidebar_secondary_check');

            this.$sidebarSecondaryToggle.on('click', (e) => {
                e.preventDefault();
                this.$body.hasClass('sidebar_secondary_active') ? this.hideSidebar() : this.showSidebar();
            });

            // hide sidebar (outside/esc click)
            this.$body.on('click keydown', (e) => {
                if(this.$body.hasClass('sidebar_secondary_active') && ( ( !$(e.target).closest(this.$sidebarSecondary).length && !$(e.target).closest(this.$sidebarSecondaryToggle).length ) || (e.which == 27) )) {
                    this.hideSidebar();
                }
            });

            // hide page sidebar on page load
            if ( this.$body.hasClass('sidebar_secondary_active') ) {
                this.hideSidebar();
            }

            // custom scroller
            //this.customScrollbar(this.$sidebarSecondary);
        }
    }

}