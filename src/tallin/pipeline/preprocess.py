import os
import numpy as np
from moviepy import VideoFileClip
from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip
import scenedetect
from scenedetect import open_video, SceneManager, ContentDetector
from scenedetect.video_splitter import split_video_ffmpeg

def split_to_clips(video_path:str,output_dir) -> list:
    """
        Use scenedetect to split long video to clips
        Args:
            video_path
            outout_dir
        Returns:
            List fo clip_path
    """
    # scenedetect
    video = open_video(video_path)
    scene_manager = SceneManager()
    scene_manager.add_detector(ContentDetector()) #threshold=threshold
    scene_manager.detect_scenes(video)
    scene_list = scene_manager.get_scene_list()
    # split
    # clip_paths = []
    # for i, scene in enumerate(scene_list):
    #     start, end = scene[0].get_seconds(), scene[1].get_seconds()
    #     clip_path = os.path.join(output_dir, f"clip_{i+1}.mp4")
    #     ffmpeg_extract_subclip(video_path, start, end, clip_path)
    #     clip_paths.append(clip_path)
    split_video_ffmpeg(video_path,scene_list,output_dir)
    # return clip_paths

# 1 frame every 5 seconds by default
def video_to_frames(video_path,output_folder,fps=0.2):
    """
    Convert a video to a sequence of images and save them to the output folder.
    """
    clip = VideoFileClip(video_path)
    clip.write_images_sequence(
        os.path.join(output_folder, "frame%04d.png"), fps)

# sampling n frames from video
def sample_n_frames(video_path, num_frames,output_dir):
    video = VideoFileClip(video_path)
    total_frames = int(video.fps * video.duration)
    frame_indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)
    frames = [video.get_frame(i / video.fps) for i in frame_indices]
    # save frame
    for i in frame_indices:
        t = i / video.fps
        video.save_frame(os.path.join(output_dir, f"clip_frame{i+1}.png"),t=i / video.fps )
    # return frames

def sample_frame_idx(sample_type: str, end_idx: int, start_idx: int = 0, **kwargs) -> list[int]:
    """Sample index from sequence [start_idx, end_idx)

    Args:
        sample_type (str): 'rand', 'uniform', 'fps'
        end_idx (int): total number of frames

    Returns:
        list[int]: sampled frame index
    """
    if sample_type == 'uniform':
        num_frames = kwargs.pop('num_frames')
        if num_frames > end_idx - start_idx:
            frame_idx = list(range(start_idx, end_idx))
        else:
            splits = np.linspace(start_idx, end_idx, num_frames+1)
            frame_idx = ((splits[:-1] + splits[1:]) // 2).int().tolist()
    elif sample_type == 'fps':
        input_fps = kwargs.pop('input_fps')
        max_num_frames = kwargs.pop('max_num_frames', -1)
        delta = input_fps / kwargs.pop('output_fps') if 'output_fps' in kwargs else 1
        if delta <= 1:
            frame_idx = list(range(start_idx, end_idx))
        else:
            frame_idx = np.arange(start_idx, end_idx, delta).int().tolist()
        if 0 < max_num_frames < len(frame_idx):
            frame_idx = sample_frame_idx('uniform', end_idx, start_idx, num_frames=max_num_frames)
    else:
        raise ValueError(f'Do not support sample_type as {sample_type}.')
    return frame_idx
