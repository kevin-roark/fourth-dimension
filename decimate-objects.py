import os
import bpy

objects = [
  'domestic/bedroom'
]

ratio = 0.18

cwd = os.getcwd()

for obj in objects:
  obj_path = cwd + '/models/' + obj + '/Model.obj'
  print('decimating ' + obj_path)
  
  bpy.ops.import_scene.obj(filepath=obj_path)

  b_obj = bpy.data.objects['Model']
  bpy.context.scene.objects.active = b_obj

  bpy.ops.object.modifier_add(type='DECIMATE')
  bpy.context.object.modifiers["Decimate"].use_collapse_triangulate = True
  bpy.context.object.modifiers["Decimate"].ratio = ratio

  decimated_path = cwd + '/models/' + obj + '/DecimatedModel.obj'
  bpy.ops.export_scene.obj(filepath=decimated_path)
