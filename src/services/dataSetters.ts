import Axios from "axios";

type TProps = {
    endpoint: string,
    body: any,
};

const postItems = ({
    endpoint,
    body,
}: TProps) => {
    return Axios.post(endpoint, body, {
        headers: {
            'Content-Type': 'application/json'
        },
        withCredentials: true
    }).then(response => response.data);
};

export default postItems;
