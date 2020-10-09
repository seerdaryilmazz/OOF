import * as axios from "axios";
import _ from "lodash";

export class NoteService {

    static getNoteById(id) {
        return axios.get(`/note-service/note/${id}`);
    }

    static saveNote(data){
        if(data.id){
            return axios.put(`/note-service/note/${data.id}`, data);
        }else{
            return axios.post("/note-service/note", data);
        }
    }
}