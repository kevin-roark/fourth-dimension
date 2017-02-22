import os
import bpy

objects = [
    'domestic/bedroom',
    'domestic/den',
    'domestic/elegant-living-room',
    'domestic/kitchen',
    'domestic/living-room',

    'friends/desmond',
    'friends/dylan-on-the-couch',
    'friends/half-dylan',
    'friends/jaq-montauk',
    'friends/nigel',
    'friends/riddhi-montauk',
    'friends/sam',
    'friends/seb-montauk',

    'natural-history/alien-rocks',
    'natural-history/big-fly',
    'natural-history/evolution',
    'natural-history/farm-scene',
    'natural-history/frog-shadow',
    'natural-history/lot-of-skulls',
    'natural-history/three-skulls',
    'natural-history/true-monkey',

    'objects-1/angel',
    'objects-1/bad-father',
    'objects-1/basketball',
    'objects-1/ben-franklin-bust',
    'objects-1/broken-eagle',
    'objects-1/father',
    'objects-1/freedom',
    'objects-1/gator',
    'objects-1/grotto',
    'objects-1/laptop',
    'objects-1/last-supper',
    'objects-1/marble-bust',
    'objects-1/mary',
    'objects-1/minion',
    'objects-1/rock',
    'objects-1/rocky',
    'objects-1/video-camera',

    'roark/isabella',
    'roark/kevin-sr',
    'roark/laurie',
    'roark/laurie-and-mom',
    'roark/melanie',
    'roark/moses',

    'still-life/bella-with-dog',
    'still-life/dylan-on-github',
    'still-life/laurie-in-the-mirror',
    'still-life/meme-nancy-reading',
    'still-life/myself-in-the-mirror',
    'still-life/photo-of-rocks'
]

ratio = 0.15

cwd = os.getcwd()

for obj in objects:
    # import obj
    obj_path = cwd + '/models/' + obj + '/Model.obj'
    print('decimating ' + obj_path)
    bpy.ops.import_scene.obj(filepath=obj_path)

    # activate imported obj
    b_obj = bpy.data.objects['Model']
    bpy.context.scene.objects.active = b_obj

    # decimate
    bpy.ops.object.modifier_add(type='DECIMATE')
    bpy.context.object.modifiers["Decimate"].use_collapse_triangulate = True
    bpy.context.object.modifiers["Decimate"].ratio = ratio

    # export
    decimated_path = cwd + '/models/' + obj + '/DecimatedModel.json'
    # bpy.ops.export_scene.obj(filepath=decimated_path)
    bpy.ops.export.three(filepath=decimated_path)

    # delete all meshes
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_by_type(type='MESH')
    bpy.ops.object.delete(use_global=False)
    for item in bpy.data.meshes:
        bpy.data.meshes.remove(item)
