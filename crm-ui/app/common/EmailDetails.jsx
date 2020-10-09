
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { CardHeader, Grid, GridCell, PageHeader } from 'susam-components/layout';
import { Button } from "susam-components/basic";
import { ActionHeader } from "../utils";
import { HeaderWithBackground } from "susam-components/layout/Header";
import { Span } from "susam-components/basic";
import { DataTable } from "susam-components/datatable/DataTable";


export class EmailDetails extends TranslatingComponent {
    state = {
        selectedEmail: {}
    };

    componentDidUpdate(prevProps){
        if(!_.isEqual(prevProps.emailList,this.props.emailList)){
            this.setState({selectedEmail: {}})
        }
    }

    renderEmailDetails(){
        if(_.isEmpty(this.state.selectedEmail)){
         return null;
        }
        else {
            return(
                <Grid>
                    <GridCell width="1-2" noMargin={true}>
                        <CardHeader title="Spot Quote Email"></CardHeader>
                     </GridCell>
                     <GridCell>
                       <Span label="To:" value=  {this.renderEmailsTo()}></Span>
                       <Span label="Cc:" value=  {this.renderEmailsCc()}></Span>
                       <Span label="Bcc:" value=  {this.renderEmailsBcc()}></Span>
                       <Span label="Subject:" value=  {this.state.selectedEmail.subject}></Span>
                       <Span label="Body:" value=  {this.state.selectedEmail.body}></Span>
                      </GridCell>
                </Grid>
            );
        }
        
    }
    renderEmailsTo(){

        return _.join(this.state.selectedEmail.to,',');
    }
    renderEmailsCc(){

        return _.join(this.state.selectedEmail.cc,',');
    }
    renderEmailsBcc(){

        return _.join(this.state.selectedEmail.bcc,',');
    }

    render() {
        let sortedEmails = _.orderBy(this.props.emailList, i => {
            return [moment(i.sentTime, 'DD/MM/YYYY HH:mm').format('X')]
        }, ['desc']);
        return (
            <Grid divider={true}>
                <GridCell width="1-6">
                  <CardHeader title="Sent Time"></CardHeader>
                    <ul className="md-list">
                        {_.defaultTo(sortedEmails, []).map(email => {
                            return <li key={email.id}>
                                <Button label={email.sentTime} flat={true} style="primary" onclick={()=>this.setState({selectedEmail: email})} fullWidth={true} />
                            </li>
                        })}
                    </ul>
                </GridCell>
                <GridCell width="5-6" >
                    
                    {this.renderEmailDetails()}       
                        
                </GridCell>
            </Grid>

        );

       
    }




}
