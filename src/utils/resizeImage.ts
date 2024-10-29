import axios from 'axios';
import sharp from 'sharp';

const fetchAndResizeImage = async (imageUrl: string, width: number | null, height: number | null) => {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    if (response.status !== 200) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    return await sharp(response.data).resize(width, height).toBuffer();
};

export default fetchAndResizeImage;